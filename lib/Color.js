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



function Color( params ) {
	this.baseName = params?.baseName ?? '' ;
	this.saturationLevel = params?.saturationLevel ?? 0 ;
	this.lightnessLevel = params?.lightnessLevel ?? 0 ;
	this.opacityLevel = params?.opacityLevel ?? 0 ;
	this.shadeLevel = params?.shadeLevel ?? 0 ;
	this.tintLevel = params?.tintLevel ?? 0 ;
	this.toneLevel = params?.toneLevel ?? 0 ;
}

module.exports = Color ;



Color.isEqual = function( a , b ) {
	return (
		a.baseName === b.baseName
		&& a.saturationLevel === b.saturationLevel
		&& a.lightnessLevel === b.lightnessLevel
		&& a.opacityLevel === b.opacityLevel
		&& a.shadeLevel === b.shadeLevel
		&& a.tintLevel === b.tintLevel
		&& a.toneLevel === b.toneLevel
	) ;
} ;

Color.prototype.isEqual = function( color ) { return Color.isEqual( this , color ) ; } ;



Color.prototype.hasModifier = function() {
	return this.saturationLevel || this.lightnessLevel || this.opacityLevel || this.shadeLevel || this.tintLevel || this.toneLevel ;
} ;



Color.prototype.cname = function() {
	var str = '' ;

	if ( this.shadeLevel >= 4 ) { str += 'darkest shade ' ; }
	else if ( this.shadeLevel >= 3 ) { str += 'darker shade ' ; }
	else if ( this.shadeLevel >= 2 ) { str += 'dark shade ' ; }
	else if ( this.shadeLevel >= 1 ) { str += 'shade ' ; }
	else if ( this.shadeLevel >= 0.5 ) { str += 'slight shade ' ; }
	else if ( this.shadeLevel >= 0.25 ) { str += 'subtle shade ' ; }
	
	if ( this.tintLevel >= 4 ) { str += 'lightest tint ' ; }
	else if ( this.tintLevel >= 3 ) { str += 'lighter tint ' ; }
	else if ( this.tintLevel >= 2 ) { str += 'light tint ' ; }
	else if ( this.tintLevel >= 1 ) { str += 'tint ' ; }
	else if ( this.tintLevel >= 0.5 ) { str += 'slight tint ' ; }
	else if ( this.tintLevel >= 0.25 ) { str += 'subtle tint ' ; }
	
	if ( this.toneLevel >= 4 ) { str += 'dullest tone ' ; }
	else if ( this.toneLevel >= 3 ) { str += 'duller tone ' ; }
	else if ( this.toneLevel >= 2 ) { str += 'dull tone ' ; }
	else if ( this.toneLevel >= 1 ) { str += 'tone ' ; }
	else if ( this.toneLevel >= 0.5 ) { str += 'slight tone ' ; }
	else if ( this.toneLevel >= 0.25 ) { str += 'subtle tone ' ; }
	
	if ( this.shadeLevel || this.tintLevel || this.toneLevel ) { str += 'of ' ; }

	if ( this.opacityLevel <= - 3 ) { str += 'dimmest ' ; }
	else if ( this.opacityLevel <= - 2 ) { str += 'dimmer ' ; }
	else if ( this.opacityLevel <= - 1 ) { str += 'dim ' ; }
	else if ( this.opacityLevel <= - 0.5 ) { str += 'slightly-dim ' ; }
	else if ( this.opacityLevel <= - 0.25 ) { str += 'subtly-dim ' ; }

	if ( this.saturationLevel <= - 3 ) { str += 'dullest ' ; }
	else if ( this.saturationLevel <= - 2 ) { str += 'duller ' ; }
	else if ( this.saturationLevel <= - 1 ) { str += 'dull ' ; }
	else if ( this.saturationLevel <= - 0.5 ) { str += 'slightly dull ' ; }
	else if ( this.saturationLevel <= - 0.25 ) { str += 'subtly dull ' ; }
	else if ( this.saturationLevel >= 3 ) { str += 'purest ' ; }
	else if ( this.saturationLevel >= 2 ) { str += 'purer ' ; }
	else if ( this.saturationLevel >= 1 ) { str += 'pure ' ; }
	else if ( this.saturationLevel >= 0.5 ) { str += 'slightly pure ' ; }
	else if ( this.saturationLevel >= 0.25 ) { str += 'subtly pure ' ; }

	if ( this.lightnessLevel <= - 3 ) { str += 'darkest ' ; }
	else if ( this.lightnessLevel <= - 2 ) { str += 'darker ' ; }
	else if ( this.lightnessLevel <= - 1 ) { str += 'dark ' ; }
	else if ( this.lightnessLevel <= - 0.5 ) { str += 'slightly dark ' ; }
	else if ( this.lightnessLevel <= - 0.25 ) { str += 'subtly dark ' ; }
	else if ( this.lightnessLevel >= 3 ) { str += 'brightest ' ; }
	else if ( this.lightnessLevel >= 2 ) { str += 'brighter ' ; }
	else if ( this.lightnessLevel >= 1 ) { str += 'bright ' ; }
	else if ( this.lightnessLevel >= 0.5 ) { str += 'slightly bright ' ; }
	else if ( this.lightnessLevel >= 0.25 ) { str += 'subtly bright ' ; }

	str += this.baseName ;

	return str ;
} ;



const MODIFIERS_KEYWORD = {
	// This modifier will have a special meaning *IF* before shade/tint/tone, it will increase it by more level
	dark: { lightnessLevel: - 1 , before: 'shade' , level: 1 } ,
	darker: { lightnessLevel: - 2 , before: 'shade' , level: 2 } ,
	darkest: { lightnessLevel: - 3 , before: 'shade' , level: 3 } ,
	light: { lightnessLevel: 1 , saturationLevel: - 1 , before: 'tint' , level: 1 } ,
	lighter: { lightnessLevel: 2 , saturationLevel: - 2 , before: 'tint' , level: 2 } ,
	lightest: { lightnessLevel: 3 , saturationLevel: - 3 , before: 'tint' , level: 3 } ,
	dull: { saturationLevel: - 1 , before: 'tone' , level: 1 } ,
	duller: { saturationLevel: - 2 , before: 'tone' , level: 2 } ,
	dullest: { saturationLevel: - 3 , before: 'tone' , level: 3 } ,

	bright: { lightnessLevel: 1 } ,
	brighter: { lightnessLevel: 2 } ,
	brightest: { lightnessLevel: 3 } ,

	pale: { saturationLevel: - 1 } ,
	paler: { saturationLevel: - 2 } ,
	palest: { saturationLevel: - 3 } ,
	pure: { saturationLevel: 1 } ,
	bold: { saturationLevel: 1 } ,
	vivid: { saturationLevel: 1 } ,
	purer: { saturationLevel: 2 } ,
	bolder: { saturationLevel: 2 } ,
	vivider: { saturationLevel: 2 } ,
	purest: { saturationLevel: 3 } ,
	boldest: { saturationLevel: 3 } ,
	vividest: { saturationLevel: 3 } ,

	pastel: { lightnessLevel: 2 , saturationLevel: - 2 } ,
	deep: { lightnessLevel: - 1 , saturationLevel: 1 } ,
	deeper: { lightnessLevel: - 2 , saturationLevel: 2 } ,
	royal: { lightnessLevel: - 2 , saturationLevel: 2 } ,
	deepest: { lightnessLevel: - 3 , saturationLevel: 3 } ,

	dim: { opacityLevel: - 1 } ,
	faint: { opacityLevel: - 1 } ,
	dimmer: { opacityLevel: - 2 } ,
	fainter: { opacityLevel: - 2 } ,
	dimmest: { opacityLevel: - 3 } ,
	faintest: { opacityLevel: - 3 } ,

	slightly: { rate: 0.65 } ,
	slight: { rate: 0.65 } ,
	subtly: { rate: 0.35 } ,
	subtle: { rate: 0.35 } ,

	tint: { tintLevel: 1 } ,
	tone: { toneLevel: 1 } ,
	shade: { shadeLevel: 1 }
} ;

const IGNORED_WORDS = new Set( [ 'of' ] ) ;



Color.parse = function( str ) {
	var modRate = 1 ,
		modLevel = 0 ,
		color = new Color() ,
		colorParts = str.split( / +/g ) ;

	for ( let i = 0 ; i < colorParts.length ; i ++ ) {
		let colorPart = colorParts[ i ] ,
			mod = MODIFIERS_KEYWORD[ colorPart ] ,
			nextColorPart = colorParts[ i + 1 ] || '' ;

		if ( mod ) {
			if ( mod.before && nextColorPart === mod.before ) {
				modLevel = mod.level ;
			}
			else if ( mod.rate ) {
				modRate = mod.rate ;
			}
			else {
				if ( mod.saturationLevel ) {
					color.saturationLevel += applyModifiers( mod.saturationLevel , modRate , modLevel ) ;
				}

				if ( mod.lightnessLevel ) {
					color.lightnessLevel += applyModifiers( mod.lightnessLevel , modRate , modLevel ) ;
				}

				if ( mod.opacityLevel ) {
					color.opacityLevel += applyModifiers( mod.opacityLevel , modRate , modLevel ) ;
				}

				if ( mod.shadeLevel ) {
					color.shadeLevel += applyModifiers( mod.shadeLevel , modRate , modLevel ) ;
				}

				if ( mod.tintLevel ) {
					color.tintLevel += applyModifiers( mod.tintLevel , modRate , modLevel ) ;
				}

				if ( mod.toneLevel ) {
					color.toneLevel += applyModifiers( mod.toneLevel , modRate , modLevel ) ;
				}

				// Rate modifiers only adjust the next modifier keyword
				modRate = 1 ;
				modLevel = 0 ;
			}
		}
		else if ( ! IGNORED_WORDS.has( colorPart ) ) {
			color.baseName = colorPart ;
		}
	}

	return color ;
} ;



function applyModifiers( level , modRate , modLevel ) {
	if ( modLevel ) {
		level += modLevel * Math.sign( level ) ;
	}

	if ( modRate !== 1 && ( level === 1 || level === -1 ) ) {
		level *= modRate ;
	}

	return level ;
}

