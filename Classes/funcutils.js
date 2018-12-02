/* This module is just for utility functions that mimic Python for easier coding */



module.exports = {
	
	range: function (start, end, step=1) {
		/* Based off Python's range function. produces range list 
		
		Parameters:
		start (int) starting number
		end (int) ending number
		step (int) step size

		Return:
		list (int[] array) array of numbers from start to end 

		Samples:
		range(1,5) >>> [1,2,3,4]
		range(1,10,2) >> [1,3,5,7,9] 
		*/

		let list = [];
		for (let i = start; i < end; i += step) {
			list.push(i);
		}

		return list;
	}

	

}