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
        fs.writeFileSync( 'interactive-lch.palette.json' , JSON.stringify( data.palette.map( color => color.hex() ) ) ) ;
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

	try {
		let content = fs.readFileSync( 'interactive-lch.palette.json' , 'utf8' ) ;
		let savedPalette = JSON.parse( content ) ;
		if ( Array.isArray( savedPalette ) && savedPalette.length) {
			data.palette = savedPalette.map( colorCode => chromajs( colorCode ) ) ;
			commands.displayPalette() ;
		}
	}
	catch ( error ) {}

	repl() ;
}



async function repl() {
	for ( ;; ) {
		term( "> " ) ;
		let input = await term.inputField( { history , autoComplete: history , autoCompleteMenu: true } ).promise ;
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
	altColor: chromajs( '#000' ) ,
	storedColor: null ,
	palette: []
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

commands.storePalette = commands.sp = ( index = data.palette.length ) => {
	index = Math.round( Math.max( 0 , Math.min( data.palette.length , + index || 0 ) ) ) ;
	data.palette[ index ] = data.color ;
	term( "Stored at index %i\n" , index ) ;
} ;

commands.setPalette = commands.setp = ( ... colorCodes ) => {
	if ( ! colorCodes.length ) {
		term.red( "Should have a list of colors as arguments\n" ) ;
		return ;
	}

	data.palette.length = 0 ;

	for ( let colorCode of colorCodes ) {
		let color = chromajs( colorCode ) ;
		data.palette.push( color ) ;
	}

	commands.displayPalette() ;
} ;

commands.getPalette = commands.gp = index => {
	if ( ! index ) {
		term.red( "Index required for this command\n" ) ;
		return ;
	}

	index = Math.round( + index || 0 ) ;

	if ( index < 0 || index >= data.palette.length ) {
		term.red( "Index out of range, current palette have %i colors\n" , data.palette.length ) ;
		return ;
	}

	data.color = data.palette[ index ] ;
	commands.displayColor() ;
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

commands.displayPalette = commands.dp = ( mode ) => {
	if ( ! data.palette.length ) {
		term( "No color in the palette.\n" ) ;
		return ;
	}

	var listMode = mode === 'l' || mode === 'list' ;

	term( "%i colors in the palette:\n" , data.palette.length ) ;

	for ( let index = 0 ; index < data.palette.length ; index ++ ) {
		let color = data.palette[ index ] ;
		let rgb = color.rgb() ;
		let indexStr = '' + index ;

		if ( indexStr.length === 1 ) { indexStr = ' ' + indexStr + ' ' ; }
		else if ( indexStr.length === 2 ) { indexStr = ' ' + indexStr ; }

		if ( rgb[ 0 ] + rgb[ 1 ] + rgb[ 2 ] > 300 ) {
			term.black.bgColorRgb( rgb[0] , rgb[1] , rgb[2] , indexStr ) ;
		}
		else {
			term.white.bgColorRgb( rgb[0] , rgb[1] , rgb[2] , indexStr ) ;
		}
		
		if ( listMode ) {
			let lch = color.lch() ;
			term( " hex: ^c%s^   RGB: ^c%i %i %i^   Lch: ^c%i %i %i^:\n" , color , rgb[0] , rgb[1] , rgb[2] , lch[0] , lch[1] , lch[2] ) ;
		}
	}

	term( "\n" ) ;
} ;

commands.dpl = () => commands.displayPalette( 'list' ) ;

commands.displaySpectrum = commands.dspec = ( l = 60 , c = 70 ) => {
	l = + l || 0 ;
	c = + c || 0 ;

	for ( let hue = 0 ; hue < 360 ; hue += 3 ) {
		let color = Palette.cleanClip( [ l , c , hue ] ) ;
		let rgb = color.rgb() ;
		term.bgColorRgb( rgb[0] , rgb[1] , rgb[2] , ' ' ) ;
	}

	term( '\n' );
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

