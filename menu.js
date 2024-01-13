'use strict';
decadeModule.import((lib, game, ui, get, ai, _status) => {
	let Mixin = {
		/**
		 * @overload
		 * @param {string} method
		 * @param {...[string | RegExp | Function][]} args
		 */
		replace(method) {
			method = method.split(/\s*\|\s*/).find(currentMethod => {
				try {
					return eval(`typeof ${currentMethod}`) != 'undefined';
				} catch (error) {
					return false;
				}
			});
			if (!method) return;
			/**
			 * @type {(string | RegExp)[]}
			 */
			const ats = [];
			/**
			 * @type {(string | Function?)[]}
			 */
			const callbacks = [];
			Array.from(arguments).forEach((argument, index) => {
				if (!index) return;
				if (index % 2) ats.push(argument);
				else callbacks.push(argument);
			});
			/**
			 * @type {string}
			 */
			const redirectingMethod = eval(`${method}.toString();`);
			let redirectedMethod = redirectingMethod;
			ats.forEach((at, index) => {
				if (typeof at == 'string' ? !redirectedMethod.includes(at) : !redirectedMethod.match(at)) return;
				const callback = callbacks[index];
				redirectedMethod = redirectedMethod.replace(at, callback ? `\n${callback.toString().replace(/^\W*(function[^{]+\{([\s\S]*)\}|[^=]+=>[^{]*\{([\s\S]*)\}|[^=]+=>\s*([\s\S]*))/i, '$2$3$4').trim()}` : '');
			});
			if (redirectedMethod == redirectingMethod) return;
			const regExpMatchArray = redirectedMethod.match(/^\S+(?=\s*\([\s\S]*?\))/);
			if (regExpMatchArray && regExpMatchArray[0] != 'function') redirectedMethod = redirectedMethod.replace(/^\S+(?=\s*\([\s\S]*?\))/, 'function');
			eval(`${method} = ${redirectedMethod}`);
		}
	};
	Mixin.replace(
		'ui.create.menu',
		/\s*\/\s*game\s*\.\s*documentZoom\s*/g,
		'',
		/\s*get\s*\.\s*is\s*\.\s*phoneLayout\s*\?\s*.*\s*:\s*/,
		'',
		/\s*if\s*\(\s*Math\s*\.\s*round\s*\(\s*2\s*\*\s*game\s*\.\s*documentZoom\s*\)\s*<\s*2\s*\)\s*{[\s\S]*?}/
	);
});
