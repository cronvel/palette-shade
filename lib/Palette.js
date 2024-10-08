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
		chromaColor = Palette.cleanClip( chromaColor , lch ) ;
		//console.error( "AFT clip:" , chromaColor , lch ) ;
	}

	return chromaColor ;
} ;



// How much we sacrifice chroma over brightness, 1=reduce both with the same factor, 2=reduce twice the chroma relative to the lightness
const CHROMA_FLEXIBILITY = 3 ;

/*
	Max LCH's L is 100.
	Max LCH's C is 134 for pure blue (120 for pure green and 105 for pure red)
*/
Palette.cleanClip = function( chromaColor , lch ) {
	if ( ! chromaColor._rgb._clipped ) { return chromaColor ; }

	var lcRatio , currentLcRatio ,
		lchClipped = false ;

	// First, non-sensical or excessive LCH values...
	if ( lch[ 0 ] < 0 ) { lch[ 0 ] = 0 ; }
	if ( lch[ 1 ] < 0 ) { lch[ 1 ] = 0 ; }
	lcRatio = lch[ 0 ] / lch[ 1 ] ;

	if ( lch[ 0 ] > 100 ) { lch[ 0 ] = 100 ; lchClipped = true ; }
	if ( lch[ 1 ] > 134 ) { lch[ 1 ] = 134 ; lchClipped = true ; }

	if ( lchClipped ) {
		currentLcRatio = lch[ 0 ] / lch[ 1 ] ;
		if ( lch[ 0 ] > 0.5 && lch[ 1 ] > 0.5 && Number.isFinite( lcRatio ) && Number.isFinite( currentLcRatio ) ) {
			if ( currentLcRatio > lcRatio ) {
				lch[ 0 ] = lch[ 1 ] * lcRatio ;
			}
			else {
				lch[ 1 ] = lch[ 0 ] / lcRatio ;
			}
		}
		chromaColor = chromajs( ... lch , 'lch' ) ;
		//console.error( "After excessive pass:" , chromaColor , lch ) ;
		if ( ! chromaColor._rgb._clipped ) { return chromaColor ; }
	}

	for ( let pass = 0 ; pass < 5 ; pass ++ ) {
		let rgb = chromaColor._rgb._unclipped ;
		let average = ( rgb[ 0 ] + rgb[ 1 ] + rgb[ 2 ] ) / 3 ;
		let max = Math.max( rgb[ 0 ] , rgb[ 1 ] , rgb[ 2 ] ) ;
		let min = Math.min( rgb[ 0 ] , rgb[ 1 ] , rgb[ 2 ] ) ;
		let reverseAverage = 255 - average ;
		let reverseMax = 255 - max ;
		let reverseMin = 255 - min ;


		if (
			max > 256
			&& ( min >= - 10 || max - 255 > - min / 4 )	// <-- hacky part, see the "else" for the explanation
		) {
			let rgbSaturation = max - average ;

			// Compute the rates and apply it, it will change both the average values (lightness) and the rgb saturation
			let lRate = 255 / max ;
			let cRate = lRate ** CHROMA_FLEXIBILITY ;
			let average2 = average * lRate ;
			let rgbSaturation2 = rgbSaturation * lRate * cRate ;
			let max2 = average2 + rgbSaturation2 ;

			// So the real rate that was applied to the max channel is
			let lRate2 = max2 / max ;

			// Correct the final rates
			let powerCorrector = Math.log( lRate ) / Math.log( lRate2 ) ;
			//let lRateFinal = lRate * lRate / lRate2 ;
			let lRateFinal = lRate ** powerCorrector ;
			let cRateFinal = lRateFinal ** CHROMA_FLEXIBILITY ;

			lch[ 0 ] *= lRateFinal ;
			lch[ 1 ] *= cRateFinal ;
			//console.error( "Pass " + pass + ":" , { average , max , min , rgbSaturation , lRate , cRate , average2 , rgbSaturation2 , max2 , lRate2 , powerCorrector , lRateFinal , cRateFinal } ) ;
		}
		else if ( min < - 10 ) {
			/*
				Chroma-js has bugs with negative RGB values.
				Negative values are so insane that it's impossible to reason with.
				They grow up really quickly without any reason once the chroma exceed even slightly the limit for a specific hue.

				So the only solution is a hack.
				Just clip negative RGB values, get the resulting chroma and apply it.
				We will also pretend being happy with values ranging from 0 to -10.
			*/

			let clipped = chromajs( ... rgb.map( e => Math.max( 1 , e ) ) ) ;
			let c = lch[ 1 ] ;
			let newC = chromajs( clipped ).get( 'lch.c' ) ;
			//console.error( "Clip negative pass " + pass + ":" , clipped , { c , newC , lch: chromajs( clipped ).lch() } ) ;
			lch[ 1 ] = newC - 0.5 ;	// Let another hack, because even after getting the new C, the hue changed, and we are back to silly negative values
		}

		chromaColor = chromajs( ... lch , 'lch' ) ;
		//console.error( "After pass " + pass + ":" , chromaColor , lch ) ;
		if ( ! chromaColor._rgb._clipped ) { return chromaColor ; }
	}

	return chromaColor ;
} ;

