'use strict';
decadeModule.import((lib, game, ui, get, ai, _status) => {
	eval(`ui.create.menu = ${ui.create.menu.toString()
		.replace(/\s*\/\s*game\s*\.\s*documentZoom\s*/g, '')
		.replace(/\s*get\s*\.\s*is\s*\.\s*phoneLayout\s*\?\s*.*\s*:\s*/g, '')
		.replace(/if\s*\(\s*Math\s*\.\s*round\s*\(\s*2\s*\*\s*game\s*\.\s*documentZoom\s*\)\s*<\s*2\s*\)\s*{[\s\S]*?}\s*/g, '')};`);
});
