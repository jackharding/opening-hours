const flatpickr = require("flatpickr");
const moment = require('moment');

import Shop from './shop';

const prettyFormat = 'dddd, Do MMMM YYYY';

const ShopInstance = new Shop();

const checkIfOpen = (date = new Date()) => {
	const open = ShopInstance.isOpen(date);
	const $status = document.querySelector('#shop-status');
	const $nextStatus = document.querySelector('#shop-next-status');
	const $nextDate = document.querySelector('#shop-next-date');
	
	if(!open) {
		$status.innerText = 'closed';
		$status.classList.remove('open');
		$nextStatus.innerText = 'open';
		$nextStatus.classList.remove('close');

		const nextOpen = ShopInstance.nextOpen(date);
		
		let day = nextOpen.format(prettyFormat);

		if(moment().isSame(nextOpen, 'day')) {
			day = 'today';
		}

		$nextDate.innerText = `${day} at ${nextOpen.format('h:mma')}`;
	} else {
		$status.innerText = 'open';
		$status.classList.add('open');
		
		$nextStatus.innerText = 'close';
		$nextStatus.classList.add('close');

		const nextClosed = ShopInstance.nextClosed(date);

		let day = nextClosed.format(prettyFormat);

		if(moment().isSame(nextClosed, 'day')) {
			day = 'today';
		}

		$nextDate.innerText = `${day} at ${nextClosed.format('h:mma')}`;
	}
}

document.addEventListener('DOMContentLoaded', () => {
	checkIfOpen(new Date());

	flatpickr('.picker', {
		enableTime: true,
		dateFormat: 'Y-m-d H:i',
		onChange: ([date]) => {
			checkIfOpen(date);
		}
	});
});

// export default handleSubmit;