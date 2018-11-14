/* This file is just for utility functions
 that kind of mimic python
 */

//Using Node.js 's style of importing'
module.exports = {
	
	range: function (start, end, step=1) {
		/* Based off Python's range function. produces range list 
		
		Examples:
		range(1,5) >>> [1,2,3,4]
		range(1,10,2) >> [1,3,5,7,9] */

		let list = [];
		for (let i = start; i < end; i += step) {
			list.push(i);
		}

		return list;
	}

}