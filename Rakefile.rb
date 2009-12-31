require 'rubygems'
require 'rake'
require 'jsmin'

@root = File.dirname(__FILE__)
@dest = 'lib'
@src = 'src'

@version = `git describe --tags --abbrev=0`.strip
@release = `git log -n 1 --format="%ci"`.strip

@create = 'digest.js'
@globs = ['intro', 'core', 'math', 'encoder', 'hmac', 'hash/*', 'outro']
@asis = ['intro', 'outro']

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

def getpath(dev)
  file = @create
  
  if dev
    ext = File.extname(file)
    base = File.basename(file, ext)
    file = base + '-dev' + ext
  end
  
  File.join(@dest, file)
end

def sub(source)
  source.
    gsub(/@VERSION/, @version).
    gsub(/@RELEASE/, @release).
    sub('/**!', '/**')
end

task :default => [:min, :dev]

task :dev do
  path = getpath(true)
  source = import
  
  Dir.chdir(@root) do
    File.open(path, 'w+b') do |out|
      out << sub(source)
    end
  end
  
  print ' + ' + path + $/
end

task :min do
  path = getpath(false)
  
  comment = import.match(/\/\*\*!.*?\*\*\/#{$/}?/m)[0] or ''
  source = comment + JSMin.minify(import).gsub(/ ?\n ?/, ' ').strip
  
  Dir.chdir(@root) do
    File.open(path, 'w+b') do |out|
      out << sub(source).rstrip + $/
    end
  end
  
  print ' + ' + path + $/
end
