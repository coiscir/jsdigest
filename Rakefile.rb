require 'rubygems'
require 'rake'
require 'packr'


@root = File.dirname(__FILE__)
@dest = 'lib'
@src = 'src'

@version = File.read('VERSION').strip
@release = `git log -n 1 --format="%ci"`.strip

@create = 'digest.js'
@globs = ['intro', 'core', 'convert', 'finish', 'encoder', 'math', 'word', 'hmac', 'hash/*', 'outro']
@asis = ['intro', 'outro']


def getpath(suffix, subdir = nil)
  file = @create
  ext = File.extname(file)
  base = File.basename(file, ext)
  
  file = [base, suffix].reject{|x| x.nil?}.join('-') + ext
  
  File.join(*[@dest, subdir, file].reject{|f| f.nil?})
end

def sub(source)
  source.
    gsub(/@VERSION/, @version).
    gsub(/@RELEASE/, @release).
    sub('/**!', '/**')
end

def import
  if @imported.nil?
    ext = File.extname(@create)
    
    Dir.chdir(File.join(@root, @src)) do
      files = @globs.map {|glob| Dir.glob(glob + ext).sort }.flatten
      
      @imported = files.map {|file|
        indent = @asis.include?(File.basename(file, ext)) ? 0 : 2
        
        IO.readlines(file).join.rstrip.
          gsub(/^/, (' ' * indent)) + $/
      }.join($/)
    end
  end
  
  return @imported
end

def export(path, source)
  Dir.chdir(@root) do
    File.open(path, 'w+b') do |out|
      out << sub(source).rstrip + $/
    end
  end
  
  return path if File.exists?(File.join(@root, path))
end

def packing
  if @packed.nil?
    options = {
      :shrink_vars => true,
      :protect => %w[host self]
    }
    
    source = import
    comment = source.match(/\/\*\*!.*?\*\*\/#{$/}?/m)[0] or ''
    @packed = comment + Packr.pack(source, options).strip
  end
  
  return @packed
end


task :default => [:build]

desc "Build library files."
task :build => [:dev, :min]

desc "Run all tasks."
task :all => [:clean, :build, :release]

desc "Clean library directory"
task :clean do
  print $/ + '-- Clean' + $/
  Dir.chdir(@root) do
    Dir.glob('lib/digest*.js') do |file|
      print ' - ' + file + $/ if File.exists?(file) and File.delete(file)
    end
  end
end

task :leadin do
  print $/ + '-- Build' + $/
end

task :dev => [:leadin] do
  print ' + ' + export(getpath('dev'), import) + $/
end

task :min => [:leadin] do
  print ' + ' + export(getpath('min'), packing) + $/
end

desc "Build library files for release."
task :release do
  print $/ + '-- Release ' + @version + $/
  print ' + ' + export(getpath(@version), packing) + $/
  print ' + ' + export(getpath(nil, 'latest'), import) + $/
end
