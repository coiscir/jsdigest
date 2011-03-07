require 'rubygems'
require 'rake'
require 'erb'
require 'packr'

@root = File.dirname( __FILE__ )

@go = File.join( @root, 'src', 'digest.js' )

@dev = File.join( 'lib', 'digest.js' )
@min = File.join( 'lib', 'digest.min.js' )
@rel = File.join( 'lib', 'latest', 'digest.js' )

@version = `git describe --tags`.strip.split('-')[0, 2].join('-')
@release = Time.now.utc.strftime( '%Y-%m-%d %H:%M:%S UTC' )


class Builder

  def initialize( version, release, start )
    @version = version
    @release = release
    
    @uncompressed = import( start )
    @minified = compress( @uncompressed )
  end

  def publish( file, minified )
    source = minified ? @minified : @uncompressed
  
    File.open( file, 'w+b' ) do |file|
      file << source
    end
    
    self
  end

  private
  
  def parse( path )
    src = File.read( path )

    Dir.chdir( File.dirname( path ) ) do
      ERB.new( src, nil, '<>' ).result( binding ).strip + $/
    end
  end

  def import( *files )
    found = files.
      map {|file| File.join( File.dirname( file ), File.basename( file, '.js' ) )}.
      map {|file| Dir.glob( file + '.js' )}.flatten.
      select {|file| File.file?( file ) and File.readable?( file )}
    
    found.map {|path| parse( path )}.join( $/ * 2 )
  end

  def compress( source )
    search = /\/\*\*!.*?\*\*\/#{$/}?/m
    options = {
      :shrink_vars => true,
      :protect => %w[self]
    }
    
    comment = source =~ search ? source.match( search )[0] : ''
    comment + Packr.pack( source, options ).strip + $/
  end

end


task :default => [:clean, :build]

task :clean do
  print $/ + '== Clean' + $/
  
  Dir.chdir( @root ) do
    Dir.glob( 'lib/*.js' ) do |file|
      print ' - ' + file + $/ if File.exists?( file ) and File.delete( file )
    end
  end
end

task :build, :version do | t, args |
  args.with_defaults( :version => @version )
  version = args[:version]
  
  print $/ + '== Build ' + version + $/
  
  Builder.new( version, @release, @go ).
    publish( File.join( @root, @dev ), false ).
    publish( File.join( @root, @min ), true )
  
  print ' + ' + @dev + $/
  print ' + ' + @min + $/
end

task :release, :version do | t, args |
  args.with_defaults( :version => @version )
  version = args[:version]
  
  print $/ + '== Release ' + version + $/
  
  Builder.new( version, @release, @go ).
    publish( File.join( @root, @rel ), false )
  
  print ' + ' + @rel + $/
end
