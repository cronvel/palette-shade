#!/usr/bin/env node

"use strict" ;

const lib = require( '..' ) ;
const Palette = lib.Palette ;
const FixedPalette = lib.FixedPalette ;
const Color = lib.Color ;
const chromajs = lib.chromajs ;

const termkit = require( 'terminal-kit' ) ;
const term = termkit.terminal ;



term.on( 'key' , key => {
    if ( key === 'CTRL_C' ) {
        term.green( 'CTRL-C detected...\n' ) ;
        term.processExit() ;
    }
} ) ;



async function repl() {
	for ( ;; ) {
		term( "> " ) ;
		let input = await term.inputField( { history } ).promise ;
		term( "\n" ) ;

		input = input.trim() ;
		let [ command , ... args ] = input.split( / +/ ) ;

		if ( Object.hasOwn( commands , command ) ) {
			await commands[ command ]( ... args ) ;
			history.push( input ) ;
		}
		else {
			term.red( "Unknown command: %s\n" , command ) ;
		}
	}
}

const history = [] ;
const data = {
	color: chromajs( '#fff' ) ,
	storedColor: null
} ;

const commands = {} ;

commands.set = color => {
	data.color = chromajs( color ) ;
	commands.displayColor() ;
} ;

commands.store = color => { data.storedColor = data.color ; } ;

commands.restore = color => {
	if ( ! data.storedColor ) { term.red( "No color stored\n" ) ; return ; }
	data.color = data.storedColor ;
} ;

commands.displayColor = commands.d = ( color = data.color ) => {
	let rgb = color.rgb() ;
	let lch = color.lch() ;
	term.bgColorRgb( rgb[0] , rgb[1] , rgb[2] , "  " ) ;
	term( " hex: ^c%s^   RGB: ^c%i %i %i^   Lch: ^c%i %i %i^:\n" , data.color , rgb[0] , rgb[1] , rgb[2] , lch[0] , lch[1] , lch[2] ) ;
} ;

commands.displayStoredColor = commands.ds = () => {
	if ( ! data.storedColor ) { term.red( "No color stored\n" ) ; return ; }
	return commands.displayColor( data.storedColor ) ;
} ;

commands.adjustL = commands['l+'] = commands['L+'] = value => {
	let lch = data.color.lch() ;
	lch[0] += + parseFloat( value ) || 0 ;
	data.color = chromajs( ... lch , 'lch' ) ;
	commands.displayColor() ;
} ;

commands.setL = commands['l'] = commands['L'] = value => {
	let lch = data.color.lch() ;
	lch[0] = + parseFloat( value ) || 0 ;
	data.color = chromajs( ... lch , 'lch' ) ;
	commands.displayColor() ;
} ;

commands.adjustC = commands['c+'] = commands['C+'] = value => {
	let lch = data.color.lch() ;
	lch[1] += + parseFloat( value ) || 0 ;
	data.color = chromajs( ... lch , 'lch' ) ;
	commands.displayColor() ;
} ;

commands.setC = commands['c'] = commands['C'] = value => {
	let lch = data.color.lch() ;
	lch[1] = + parseFloat( value ) || 0 ;
	data.color = chromajs( ... lch , 'lch' ) ;
	commands.displayColor() ;
} ;

commands.adjustH = commands['h+'] = commands['H+'] = value => {
	let lch = data.color.lch() ;
	lch[2] += + parseFloat( value ) || 0 ;
	data.color = chromajs( ... lch , 'lch' ) ;
	commands.displayColor() ;
} ;

commands.setH = commands['h'] = commands['H'] = value => {
	let lch = data.color.lch() ;
	lch[2] = + parseFloat( value ) || 0 ;
	data.color = chromajs( ... lch , 'lch' ) ;
	commands.displayColor() ;
} ;





var exporters = {} ;

exporters.display = () => {
	let fixedPalette = new FixedPalette( config ) ;
	console.log( "Color count: " , fixedPalette.indexed.length ) ;
	console.log( "Indexed palette: " , fixedPalette.indexed ) ;
	console.log( "Names: " , fixedPalette.named ) ;
} ;



exporters['index-json'] = () => {
	let fixedPalette = new FixedPalette( config ) ;
	let content = JSON.stringify( fixedPalette.indexed ) ;

	if ( outputFile ) { fs.writeFileSync( outputFile , content ) ; }
	else if ( content ) { console.log( content ) ; }
} ;



exporters['names-json'] = () => {
	let fixedPalette = new FixedPalette( config ) ;
	let content = JSON.stringify( fixedPalette.named ) ;

	if ( outputFile ) { fs.writeFileSync( outputFile , content ) ; }
	else if ( content ) { console.log( content ) ; }
} ;




repl() ;

