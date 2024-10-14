/*
	Palette Shade

	Copyright (c) 2023 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



//const chromajs = require( 'chroma-js' ) ;

// Custom build of chroma-js, using the fork regorxxx/chroma.js, and a customized index-ultra-light.js,
// dividing the size of the chroma-js lib by 4.5.
const chromajs = require( '../extlib/chromajs.custom.js' ) ;



const DEFAULT_FIXED_COLORS = {
	'black': '#24292e' ,
	'white': '#ffffff' ,
	'gray': '#74797e'
} ;

const DEFAULT_BASE_COLORS = {
	'red': '#e32322' ,
	'orange': '#f18e1c' ,
	'yellow-orange': '#fdc60b' ,
	'yellow': '#f4e500' ,
	'yellow-green': '#8cbb26' ,
	'green': '#25ad28' ,
	'blue-green': '#1bc17d' ,
	'cyan': '#0dc0cd' ,
	'blue': '#2a60b0' ,
	'blue-violet': '#3b3ba2' ,
	'violet': '#713795' ,
	'red-violet': '#bd0a7d'
} ;

const DEFAULT_ALIASES = {
	'grey': 'gray' ,
	'orange-yellow': 'yellow-orange' ,
	'amber': 'yellow-orange' ,
	'gold': 'yellow-orange' ,
	'green-yellow': 'yellow-green' ,
	'chartreuse': 'yellow-green' ,
	'green-blue': 'blue-green' ,
	'turquoise': 'blue-green' ,
	'turquoise-green': 'blue-green' ,
	'teal': 'blue-green' ,
	'turquoise-blue': 'cyan' ,
	'violet-blue': 'blue-violet' ,
	'indigo': 'blue-violet' ,
	'purple': 'violet' ,
	'violet-red': 'red-violet' ,
	'magenta': 'red-violet'
} ;

const EXTRA_COLORS = {
	'crimson': '#dc143c' ,
	'vermilion': '#e34234' ,
	'brown': '#a52a2a' ,
	'bronze': '#cd7f32' ,
	'coquelicot': '#ff3800' ,
	//'flame': '#e25822' ,
	//'salmon': '#ff8c69' ,
	'coral-pink': '#f88379' ,
	'see-green': '#2e8b57' ,
	'medium-spring-green': '#00fa9a' ,
	'olivine': '#9ab973' ,
	'royal-blue': '#4169e1' ,
	'purple': '#800080' ,
	//'tyrian-purple': '#66023c' ,
	//'purple-heart': '#69359c' ,
	'lavender-purple': '#967bb6' ,
	//'classic-rose' , 'light-pink': '#fbcce7' ,
	'pink': '#ffc0cb'
	//'lime': '#bfff00' ,
} ;

const EXTRA_ALIASES = {
	'cinnabar': 'vermilion'
	//'lemon-lime': 'lime'
} ;

const SPECIAL_COLORS = {
	shadeColor: 'shadeColor' ,
	'shade-color': 'shadeColor' ,
	tintColor: 'tintColor' ,
	'tint-color': 'tintColor' ,
	toneColor: 'toneColor' ,
	'tone-color': 'toneColor' ,
} ;



const LCH_L_STEP = 18 ;
//const LCH_C_STEP = 18 ;
const LCH_C_RATE_STEP = 0.25 ;
const SHADE_RATE_STEP = 0.25 ;
const SHADE_HUE_SHIFT_PEAK = 90 ;



function Palette( params = {} ) {
	this.fixedColors = {} ;
	this.baseColors = {} ;
	this.aliases = Object.assign( {} , DEFAULT_ALIASES ) ;
	this.partial = !! params.partial ;

	this.tintColor = chromajs( params.tintColor || '#ffffff' ) ;
	this.toneColor = chromajs( params.toneColor || '#808080' ) ;
	this.shadeColor = chromajs( params.shadeColor || '#000000' ) ;

	// Lightness/saturation steps
	this.lightnessStep =
		params.lightnessRate ? LCH_L_STEP * params.lightnessRate :
		+ params.lightnessStep || LCH_L_STEP ;
	this.chromaRateStep =
		params.chromaRate ? LCH_C_RATE_STEP * params.chromaRate :
		+ params.chromaRateStep || LCH_C_RATE_STEP ;

	// Shade/tint/tone steps config
	this.shadeHueShiftRate =
		params.shadeHueShiftRate ? params.shadeHueShiftRate :
		1 ;
	this.shadeHueShiftPeak =
		params.shadeHueShiftPeak ? params.shadeHueShiftPeak :
		SHADE_HUE_SHIFT_PEAK ;
	this.shadeRateStep =
		params.shadeRate ? SHADE_RATE_STEP * params.shadeRate :
		+ params.shadeRateStep || SHADE_RATE_STEP ;

	if ( params.fixedColors ) { this.addFixedColors( params.fixedColors ) ; }
	if ( params.baseColors ) { this.addBaseColors( params.baseColors ) ; }
	if ( params.aliases ) { this.addAliases( params.aliases ) ; }

	if ( ! this.partial ) {
		this.addFixedColors( DEFAULT_FIXED_COLORS , true ) ;
		this.addBaseColors( DEFAULT_BASE_COLORS , true ) ;
	}
}

module.exports = Palette ;



Palette.prototype.addAliases = function( aliases ) {
	if ( ! aliases || typeof aliases !== 'object' ) { return ; }
	Object.assign( this.aliases , aliases ) ;
} ;



Palette.prototype.addFixedColors = function( fixedColors , ifNotExists = false ) {
	if ( ! fixedColors || typeof fixedColors !== 'object' ) { return ; }

	for ( let name in fixedColors ) {
		let colorDef = fixedColors[ name ] ;
		if ( this.aliases[ name ] ) { name = this.aliases[ name ] ; }

		if ( colorDef && ( ! ifNotExists || ( ! this.baseColors[ name ] && ! this.fixedColors[ name ] ) ) ) {
			this.fixedColors[ name ] = chromajs( colorDef ) ;
		}
	}
} ;



Palette.prototype.addBaseColors = function( baseColors , ifNotExists = false ) {
	if ( ! baseColors || typeof baseColors !== 'object' ) { return ; }

	for ( let name in baseColors ) {
		let colorDef = baseColors[ name ] ;
		if ( this.aliases[ name ] ) { name = this.aliases[ name ] ; }

		if ( colorDef && ( ! ifNotExists || ( ! this.baseColors[ name ] && ! this.fixedColors[ name ] ) ) ) {
			this.baseColors[ name ] = chromajs( colorDef ) ;
		}
	}
} ;



Palette.prototype.has = function( colorObject ) {
	var name = colorObject.baseName ;
	if ( Object.hasOwn( this.aliases , name ) ) { name = this.aliases[ name ] ; }
	if ( Object.hasOwn( SPECIAL_COLORS , name ) ) { return true ; }
	return Object.hasOwn( this.fixedColors , name ) || Object.hasOwn( this.baseColors , name ) ;
} ;



Palette.prototype.get = function( colorObject ) {
	var name = colorObject.baseName ;
	if ( this.aliases[ name ] ) { name = this.aliases[ name ] ; }

	var chromaColor ;

	if ( Object.hasOwn( SPECIAL_COLORS , name ) ) {
		return this[ SPECIAL_COLORS[ name ] ] ;
	}

	if ( Object.hasOwn( this.fixedColors , name ) ) {
		return this.fixedColors[ name ] ;
	}

	if ( Object.hasOwn( this.baseColors , name ) ) {
		chromaColor = this.baseColors[ name ] ;

		if ( colorObject.hasModifier() ) {
			chromaColor = this.adjust( chromaColor , colorObject ) ;
		}

		return chromaColor ;
	}

	return null ;
} ;



Palette.prototype.getHex = function( colorObject ) {
	var chromaColor = this.get( colorObject ) ;
	return chromaColor ? chromaColor.hex() : null ;
} ;



Palette.prototype.getRgb = function( colorObject ) {
	var chromaColor = this.get( colorObject ) ;
	if ( ! chromaColor ) { return null ; }
	return Palette.chromaToRgb( chromaColor ) ;
} ;



Palette.chromaToRgb = chromaColor => {
	var [ r , g , b ] = chromaColor.rgb() ;
	return { r , g , b } ;
} ;



Palette.prototype.lchShade = function( lch1 , chromaColor2 , rate , hueShiftRate = this.shadeHueShiftRate ) {
	rate = rate < 0 ? 0 : rate > 1 ? 1 : rate ;

	var l , c , h ,
		lch2 = chromaColor2.lch() ,
		hue1 = lch1[ 2 ] ,
		hue2 = lch2[ 2 ] ,
		invRate = 1 - rate ,
		deltaHue = Math.abs( hue1 - hue2 ) ,
		hueRate = rate * hueShiftRate ;

	if ( deltaHue > 180 ) { deltaHue = 360 - deltaHue ; }	
	if ( deltaHue > this.shadeHueShiftPeak ) { hueRate *= ( 180 - deltaHue ) / ( 180 - this.shadeHueShiftPeak ) ; }
	
	var invHueRate = 1 - hueRate ;

	// Lightness, nothing fancy here
	l = lch1[ 0 ] * invRate + lch2[ 0 ] * rate ;

	// Chroma, for instance we do the same like lightness
	c = lch1[ 1 ] * invRate + lch2[ 1 ] * rate ;

	// Hue, it range from 0 to 360 degrees, we check that we are turning into the right direction
	if ( Math.abs( hue1 - hue2 ) <= 180 ) {
		h = hue1 * invHueRate + hue2 * hueRate ;
	}
	else {
		if ( hue1 < hue2 ) { hue1 += 360 ; }
		else { hue2 += 360 ; }
		h = ( hue1 * invHueRate + hue2 * hueRate ) % 360 ;
	}
	
	lch1[ 0 ] = l ;
	lch1[ 1 ] = c ;
	lch1[ 2 ] = h ;
} ;



/*
	Chroma-js .brighten()/.darken() uses a +/- 18 increment on L of the LCH colorspace,
	while .saturate()/.desaturate() also uses +/- 18 on C of the LCH colorspace.
*/
Palette.prototype.adjust = function( chromaColor , colorObject ) {
	var lch = chromaColor.lch() ;

	if ( colorObject.shadeLevel ) {
		this.lchShade( lch , this.shadeColor , Math.min( 1 , colorObject.shadeLevel * this.shadeRateStep ) ) ;
	}
	else if ( colorObject.tintLevel ) {
		this.lchShade( lch , this.tintColor , Math.min( 1 , colorObject.tintLevel * this.shadeRateStep ) ) ;
	}
	else if ( colorObject.toneLevel ) {
		// We force hue-shifting to 1 for tones
		this.lchShade( lch , this.toneColor , Math.min( 1 , colorObject.toneLevel * this.shadeRateStep ) , 1 ) ;
	}

	if ( colorObject.lightnessLevel ) { lch[ 0 ] = Math.max( 0 , lch[ 0 ] + colorObject.lightnessLevel * this.lightnessStep ) ; }
	if ( colorObject.saturationLevel ) { lch[ 1 ] = Math.max( 0 , lch[ 1 ] * ( 1 + colorObject.saturationLevel * this.chromaRateStep ) ) ; }

	//console.error( "Initial lch:" , lch ) ;
	chromaColor = chromajs( ... lch , 'lch' ) ;

	if ( chromaColor._rgb._clipped ) {
		//console.error( "BF clip:" , chromaColor , lch ) ;
		chromaColor = Palette.cleanClip( lch ) ;
		//console.error( "AFT clip:" , chromaColor , lch ) ;
	}

	return chromaColor ;
} ;




// When a color is clipped (out of RGB range), try to clip it cleanly, by preserving the hue, and adjust chroma and lightness
// (we prefer to adjust chroma more than lightness, lightness is more important)
const CHROMA_PASS_RATE = 0.25 ;
const LIGHTNESS_PASS_RATE = 0.1 ;	// Lightness is adjusted more slowly
const PASS_COUNT = 5 ;

Palette.cleanClip = function( [ lightness , chroma , hue ] ) {
	var chromaColor ,
		minLightness ,
		maxLightness ,
		maxChroma ,
		lchClipped = false ;

	//console.error( "Initial values:" , { lightness , chroma , hue } , chromajs( lightness , chroma , hue , 'lch' ) ) ;

	// First, non-sensical or excessive LCH values...
	if ( lightness < 0 ) { lightness = 0 ; lchClipped = true ; }
	if ( chroma < 1 ) { chroma = 0 ; lchClipped = true ; }
	if ( lightness > 100 ) { lightness = 100 ; lchClipped = true ; }

	// Clip chroma that are excessive, regardless of lightness
	maxChroma = Palette.getMaxChromaForHue( hue ) ;
	if ( chroma > maxChroma ) { chroma = maxChroma ; lchClipped = true ; }


	if ( lchClipped ) {
		// Ok, we have somewhat clipped the extravagant value, retry now
		maxChroma = Palette.getMaxChromaForHueAndLightness( hue , lightness ) ;
		//console.error( "After excessive values are clipped:" , { lightness , chroma , hue } , chromajs( lightness , chroma , hue , 'lch' ) ) ;
		if ( chroma <= maxChroma ) {
			chromaColor = chromajs( lightness , chroma , hue , 'lch' ) ;
			//console.error( "Clipping excessive values is sufficient:" , { lightness , chroma , hue } , chromaColor ) ;
			return chromaColor ;
		}
	}

	for ( let pass = 0 ; pass < PASS_COUNT ; pass ++ ) {
		minLightness = Palette.getMinLightnessForHueAndChroma( hue , chroma ) ;
		maxLightness = Palette.getMaxLightnessForHueAndChroma( hue , chroma ) ;
		maxChroma = Palette.getMaxChromaForHueAndLightness( hue , lightness ) ;
		
		let targetLightness = Math.max( minLightness , Math.min( lightness , maxLightness ) ) ,
			targetChroma = Math.min( chroma , maxChroma ) ,
			lightnessDelta = targetLightness - lightness ,
			chromaDelta = targetChroma - chroma ;

		//console.error( "Pass" , pass , "details:" , { targetLightness , targetChroma, lightnessDelta , chromaDelta , minLightness , maxLightness , maxChroma } ) ;
		
		lightness = lightnessDelta >= 0 ? Math.ceil( lightness + lightnessDelta * LIGHTNESS_PASS_RATE ) : Math.floor( lightness + lightnessDelta * LIGHTNESS_PASS_RATE ) ;
		chroma = chromaDelta >= 0 ? Math.ceil( chroma + chromaDelta * CHROMA_PASS_RATE ) : Math.floor( chroma + chromaDelta * CHROMA_PASS_RATE ) ;

		chromaColor = chromajs( lightness , chroma , hue , 'lch' ) ;
		//console.error( "After pass " + pass + ":" , chromaColor , lch ) ;
		if ( ! chromaColor._rgb._clipped ) {
			//console.error( "Pass" , pass , "is sufficient:" , { lightness , chroma , hue } , chromaColor ) ;
			return chromaColor ;
		}
		//console.error( "After pass" , pass , ":" , { lightness , chroma , hue } , chromaColor ) ;
	}
	
	// Ok, force chroma adjustement now
	chroma = Palette.getMaxChromaForHueAndLightness( hue , lightness ) ;
	chromaColor = chromajs( lightness , chroma , hue , 'lch' ) ;
	return chromaColor ;
} ;



/*
	LCH min/max.
	It helps with LCH to RGB colorspace conversion.
	It gives for each hue or hue x [ chroma | lightness ] combination the maximum [ lightness | chroma ] possible without
	breaking RGB.
	It uses a lookup table to avoid chromajs iteration
*/

Palette.getMaxChromaForHue = hue => {
	if ( ! lookupTables.reconstructed ) { reconstructLookupTables() ; }
	hue = Math.round( hue ) ;
	return lookupTables.hueMaxChroma[ hue ] ;
} ;



Palette.getMaxChromaForHueAndLightness = ( hue , lightness ) => {
	if ( ! lookupTables.reconstructed ) { reconstructLookupTables() ; }
	hue = Math.round( hue ) ;
	lightness = Math.round( lightness ) ;
	return lookupTables.hueLightnessMaxChroma[ hue ][ lightness ] ;
} ;



Palette.getMinLightnessForHueAndChroma = ( hue , chroma ) => {
	if ( ! lookupTables.reconstructed ) { reconstructLookupTables() ; }
	hue = Math.round( hue ) ;
	chroma = Math.round( chroma ) ;
	return lookupTables.hueChromaMinLightness[ hue ][ chroma ] ;
} ;



Palette.getMaxLightnessForHueAndChroma = ( hue , chroma ) => {
	if ( ! lookupTables.reconstructed ) { reconstructLookupTables() ; }
	hue = Math.round( hue ) ;
	chroma = Math.round( chroma ) ;
	return lookupTables.hueChromaMaxLightness[ hue ][ chroma ] ;
} ;



// Lookup table reconstruction

const lookupTables = require( '../lib/lch-lookup.json' ) ;
lookupTables.reconstructed = false ;

const base64ToArray = str => Buffer.from( str , 'base64' ) ;

function reconstructLookupTables() {
	if ( lookupTables.reconstructed ) { return ; }
	
	lookupTables.hueMaxChroma = base64ToArray( lookupTables.hueMaxChroma ) ;

	var flatHueChromaMinLightness = base64ToArray( lookupTables.hueChromaMinLightness ) ;
	var flatHueChromaMaxLightness = base64ToArray( lookupTables.hueChromaMaxLightness ) ;
	var flatHueLightnessMaxChroma = base64ToArray( lookupTables.hueLightnessMaxChroma ) ;

	lookupTables.hueChromaMinLightness = [] ;
	lookupTables.hueChromaMaxLightness = [] ;
	lookupTables.hueLightnessMaxChroma = [] ;

	for ( let h = 0 , lightnessIndex = 0 , chromaIndex = 0 ; h < 360 ; h ++ ) {
		lookupTables.hueChromaMinLightness[ h ] = [] ;
		lookupTables.hueChromaMaxLightness[ h ] = [] ;
		lookupTables.hueLightnessMaxChroma[ h ] = [] ;

		for ( let c = 0 ; c <= lookupTables.hueMaxChroma[ h ] ; c ++ , lightnessIndex ++ ) {
			lookupTables.hueChromaMinLightness[ h ][ c ] = flatHueChromaMinLightness[ lightnessIndex ] ;
			lookupTables.hueChromaMaxLightness[ h ][ c ] = flatHueChromaMaxLightness[ lightnessIndex ] ;
		}

		for ( let l = 0 ; l <= 100 ; l ++ , chromaIndex ++ ) {
			lookupTables.hueLightnessMaxChroma[ h ][ l ] = flatHueLightnessMaxChroma[ chromaIndex ] ;
		}
	}
	
	lookupTables.reconstructed = true ;
}

