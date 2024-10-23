#!/usr/bin/env node

"use strict" ;

const lib = require( '..' ) ;
const Palette = lib.Palette ;
const FixedPalette = lib.FixedPalette ;
const Color = lib.Color ;
const chromajs = lib.chromajs ;

const termkit = require( 'terminal-kit' ) ;
const term = termkit.terminal ;

const fs = require( 'fs' ) ;



term.on( 'key' , key => {
    if ( key === 'CTRL_C' ) {
        term.green( 'CTRL-C detected...\n' ) ;
        fs.writeFileSync( 'interactive-lch.history.json' , JSON.stringify( history.slice( -100 ) ) ) ;
        term.processExit() ;
    }
} ) ;



function run() {
	try {
		let content = fs.readFileSync( 'interactive-lch.history.json' , 'utf8' ) ;
		let savedHistory = JSON.parse( content ) ;
		if ( Array.isArray( savedHistory ) ) { history = savedHistory ; }
	}
	catch ( error ) {}

	repl() ;
}



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

var history = [] ;
const data = {
	color: chromajs( '#fff' ) ,
	storedColor: null
} ;

const commands = {} ;

commands.set = colorCode => {
	data.color = chromajs( colorCode ) ;
	commands.displayColor() ;
} ;

commands.store = () => { data.storedColor = data.color ; } ;

commands.restore = () => {
	if ( ! data.storedColor ) { term.red( "No color stored\n" ) ; return ; }
	data.color = data.storedColor ;
} ;

commands.displayColor = commands.d = ( color = data.color ) => {
	let rgb = color.rgb() ;
	let lch = color.lch() ;
	term.bgColorRgb( rgb[0] , rgb[1] , rgb[2] , "  " ) ;
	term( " hex: ^c%s^   RGB: ^c%i %i %i^   Lch: ^c%i %i %i^:\n" , color , rgb[0] , rgb[1] , rgb[2] , lch[0] , lch[1] , lch[2] ) ;
} ;

commands.displayStoredColor = commands.ds = () => {
	if ( ! data.storedColor ) { term.red( "No color stored\n" ) ; return ; }
	return commands.displayColor( data.storedColor ) ;
} ;

commands.adjustL = commands['l+'] = commands['L+'] = value => {
	let lch = data.color.lch() ;
	lch[0] += + parseFloat( value ) || 0 ;
	data.color = Palette.cleanClip( lch ) ;
	commands.displayColor() ;
} ;

commands.setL = commands['l'] = commands['L'] = value => {
	let lch = data.color.lch() ;
	lch[0] = + parseFloat( value ) || 0 ;
	data.color = Palette.cleanClip( lch ) ;
	commands.displayColor() ;
} ;

commands.adjustC = commands['c+'] = commands['C+'] = value => {
	let lch = data.color.lch() ;
	lch[1] += + parseFloat( value ) || 0 ;
	data.color = Palette.cleanClip( lch ) ;
	commands.displayColor() ;
} ;

commands.setC = commands['c'] = commands['C'] = value => {
	let lch = data.color.lch() ;
	lch[1] = + parseFloat( value ) || 0 ;
	data.color = Palette.cleanClip( lch ) ;
	commands.displayColor() ;
} ;

commands.adjustH = commands['h+'] = commands['H+'] = value => {
	let lch = data.color.lch() ;
	lch[2] += + parseFloat( value ) || 0 ;
	data.color = Palette.cleanClip( lch ) ;
	commands.displayColor() ;
} ;

commands.setH = commands['h'] = commands['H'] = value => {
	let lch = data.color.lch() ;
	lch[2] = + parseFloat( value ) || 0 ;
	data.color = Palette.cleanClip( lch ) ;
	commands.displayColor() ;
} ;

commands.ramp = ( count , adjustL , adjustC , adjustH ) => {
	adjustL = + parseFloat( adjustL ) || 0 ;
	adjustC = + parseFloat( adjustC ) || 0 ;
	adjustH = + parseFloat( adjustH ) || 0 ;

	let lch = data.color.lch() ;

	commands.displayColor( data.color ) ;

	while ( count -- ) {
		lch[0] += adjustL ;
		lch[1] += adjustC ;
		lch[2] += adjustH ;
		let color = Palette.cleanClip( lch ) ;
		commands.displayColor( color ) ;

		// Lch after the clipping
		lch = color.lch() ;
	}
} ;

commands.mix = ( colorCode , rate = 0.5 ) => {
	let invRate = 1 - rate ;
	let lch1 = data.color.lch() ;
	let lch2 = chromajs( colorCode ).lch() ;
	let lch = [
		lch1[0] * invRate + lch2[0] * rate ,
		lch1[1] * invRate + lch2[1] * rate ,
		lch1[2] * invRate + lch2[2] * rate
	] ;
	let color = Palette.cleanClip( lch ) ;
	commands.displayColor( color ) ;
} ;



run() ;

