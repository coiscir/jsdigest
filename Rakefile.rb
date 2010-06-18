require 'rubygems'
require 'rake'
require 'packr'

@root = File.dirname(__FILE__)

@start = File.join(@root, 'src', 'core.js')
@globs = ['convert', 'finish', 'encoder', 'math', 'word', 'hmac', 'hash/*']
@ext = '.js'

@devel = File.join('lib', 'digest-dev.js')
@minify = File.join('lib', 'digest.js')
@latest = File.join('lib', 'latest', 'digest.js')

@version = File.read('VERSION').strip
@release = `git --no-pager log -n 1 --format="%ct"`.strip.to_i
@release = Time.at(@release).utc.strftime('%Y-%m-%d %H:%M:%S UTC')
@revision = `git --no-pager log -n 1 --format="%h"`.strip

def statsub(source)
  source.
    gsub(/@VERSION/, @version).
    gsub(/@RELEASE/, @release).
    gsub(/@REVISION/, @revision).
    sub('/**!', '/**')
end

def finish(file, source)
  File.open(file, 'w+b') do |file|
    file << statsub(source).rstrip + $/
  end
end

def grab(file)
  File.read(file).rstrip if File.file?(file) and File.readable?(file)
end

def import
  if @imported.nil?
    Dir.chdir(File.dirname(@start)) do
      files = @globs.
        map {|glob| Dir.glob(glob + @ext).sort }.flatten.
        select {|file| File.file?(file) and File.readable?(file)}
      
      @imported = files.map {|file| grab(file)}.join($/)
    end
  end
  
  return @imported
end

def combine(start, import)
  start.sub(/^.*?@IMPORT\s*/, import.gsub(/^/, (' ' * 2)).rstrip + $/)
end

def build
  if @built.nil?
    @built = combine(grab(@start), import)
  end
  
  return @built
end

def compress
  if @packed.nil?
    search = /\/\*\*!.*?\*\*\/#{$/}?/m
    options = {
      :shrink_vars => true,
      :protect => %w[self]
    }
    
    source = build
    comment = source =~ search ? source.match(search)[0] : ''
    
    @packed = comment + Packr.pack(source, options).strip
  end
  
  return @packed
end

task :default => [:build]

desc "Execute all steps"
task :all => [:clean, :build, :release]

desc "Clean library files."
task :clean do
  print $/ + '-- Clean' + $/
  
  Dir.chdir(@root) do
    Dir.glob('lib/*.js') do |file|
      print ' - ' + file + $/ if File.exists?(file) and File.delete(file)
    end
  end
end

desc "Build library files."
task :build do
  print $/ + '-- Build' + $/
  
  finish(File.join(@root, @devel), build)
  print ' + ' + @devel + $/
  
  finish(File.join(@root, @minify), compress)
  print ' + ' + @minify + $/
end

desc "Build latest library file."
task :release do
  print $/ + '-- Release' + $/
  
  finish(File.join(@root, @latest), compress)
  print ' + ' + @latest + $/
end
