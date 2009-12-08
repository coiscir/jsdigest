require 'rake'
require 'erb'
require 'jsmin'

BUILD_FILES = ['digest.js', 'digest-more.js']
CLEAN_FILES = ['digest.js']

JSD_VERSION = '1.1.0'

################
## Tasks
task :default => :build

desc "Build library files."
task :build do
  make(false)
end

desc "Build release library files."
task :release do
  make(true)
end

desc "Clean all build and release files."
task :clean do
  clean
end

################
## Operations
def version
  return JSD_VERSION
end

def make(release)
  print $/ + '== Build :: ' + version.to_s + $/
  
  BUILD_FILES.each do |start|
    Builder.build('src', 'lib', start, version, release) do |path|
      print ' + ' + path + $/
    end
  end
end

def clean
  print $/ + '== Clean' + $/
  
  CLEAN_FILES.each do |file|
    Builder.clean('lib', file) do |path|
      print ' - ' + path + $/
    end
  end
end

################
## Builder
module Builder
  module Reader
    def parse(file, minify)
      unless File.file?(file) && File.readable?(file)
        raise "Cannot read file: '#{file}'"
      end
      
      Dir.chdir(File.dirname(file)) do
        src = IO.readlines(File.basename(file)).join
        src = ERB.new(src, nil, '<>').result(binding).strip + $/
        
        if minify
          src = JSMin.minify(src).gsub(/ ?\n ?/, ' ').strip
        end
        
        return src
      end
    end
    
    # overload: import(indent, globs...)
    def import(*globs)
      indent = globs.first.is_a?(Numeric) ? globs.shift : 0
      
      files = globs.map {|glob|
        Dir.glob(glob).sort
      }.flatten
      
      srcs = files.map {|file|
        parse(file, @min).gsub(/^/, (' ' * indent))
      }
      
      return srcs.join($/).rstrip
    end
    
    def version
      @ver
    end
  end
  
  class << self
    include Reader
    
    def build(source, destination, start, version, release)
      @root = File.dirname(__FILE__)
      @src  = source
      @dest = destination
      @file = start
      @ver  = version
      @rel  = release
      
      minify = @rel ? [true] : [true, false]
      builds = @rel ? [@ver] : [nil]
      
      minify.each do |min|
        @min = min
        
        start = File.join(@root, @src, @file)
        final = parse(start, false)
        
        builds.each do |ver|
          path = File.join(@root, @dest, named(@file, @min, ver))
          File.open(path, 'w+b') do |file|
            file << final
          end
        end
      end
      
      builds.each do |ver|
        minify.each do |min|
          yield File.join(@dest, named(@file, min, ver))
        end
      end
    end
    
    def clean(dest, start)
      return if start.nil? or start.empty?
      
      root = File.dirname(__FILE__)
      
      Dir.chdir(File.join(root, dest)) do
        ext  = File.extname(start)
        name = File.basename(start, ext)
        
        Dir.glob(name + "*" + ext).sort.each do |file|
          if File.file?(file)
            yield File.join(dest, file) if File.delete(file) > 0
          end
        end
      end
    end
    
    def named(file, min, ver)
      ext  = File.extname(file)
      name = File.basename(file, ext)
      (name, build) = name.split('-', 2)
      suffix = min ? nil : 'dev'
      return [name, ver, build, suffix].reject{|x| x.nil?}.join('-') + ext
    end
  end
end
