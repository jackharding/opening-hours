const moment = require('moment');

import Shop from './shop';

const ShopInstance = new Shop();

test('isOpen works when closed', () => {
	// Sunday
	const date = moment(new Date('2020-02-16T08:00:00')).utc();
	const open = ShopInstance.isOpen(date);

	expect(open).toBeFalsy();
});

test('isOpen works when weekday but before opening hours', () => {
	// Monday
	const date = moment(new Date('2020-02-17T08:00:00')).utc();
	const open = ShopInstance.isOpen(date);

	expect(open).toBeFalsy();
});

test('isOpen works when weekday but in between opening hours', () => {
	const date = moment(new Date('2020-02-17T13:00:00')).utc();
	const open = ShopInstance.isOpen(date);

	expect(open).toBeFalsy();
});

test('isOpen works when weekday during open hours', () => {
	const date = moment(new Date('2020-02-17T11:00:00')).utc();
	const open = ShopInstance.isOpen(date);

	expect(open).toBeTruthy();
});

test('nextOpen retrieves hours when given DateTime is New Years 2020', () => {
	const date = moment(new Date('2020-01-01T00:00:00')).utc();
	const nextOpen = ShopInstance.nextOpen(date);

	expect(nextOpen.format('DD-MM-YYYY h:mma')).toEqual('02-01-2020 9:00am');
});

test('nextOpen retrieves hours when given DateTime is Sunday', () => {
	const date = moment(new Date('2020-02-16T00:00:00')).utc();
	const nextOpen = ShopInstance.nextOpen(date);

	expect(nextOpen.format('DD-MM-YYYY h:mma')).toEqual('17-02-2020 9:00am');
});

test('nextOpen retrieves hours when given DateTime is weekday before opening hours', () => {
	const date = moment(new Date('2020-02-17T00:00:00')).utc();
	const nextOpen = ShopInstance.nextOpen(date);

	expect(nextOpen.format('DD-MM-YYYY h:mma')).toEqual('17-02-2020 9:00am');
});

test('nextOpen retrieves hours when given DateTime is weekday during opening hours', () => {
	const date = moment(new Date('2020-02-17T10:00:00')).utc();
	const nextOpen = ShopInstance.nextOpen(date);

	expect(nextOpen.format('DD-MM-YYYY h:mma')).toEqual('17-02-2020 10:00am');
});

test('nextOpen retrieves hours when given DateTime is weekday but during closed hours', () => {
	const date = moment(new Date('2020-02-17T12:20:00')).utc();
	const nextOpen = ShopInstance.nextOpen(date);

	expect(nextOpen.format('DD-MM-YYYY h:mma')).toEqual('17-02-2020 1:30pm');
});

test('nextClosed returns input DateTime when given DateTime is New Years 2020', () => {
	const date = moment(new Date('2020-01-01T00:00:00')).utc();
	const nextClosed = ShopInstance.nextClosed(date);

	expect(nextClosed.format('DD-MM-YYYY h:mma')).toEqual('01-01-2020 12:00am');
});

test('nextClosed returns input DateTime when given DateTime is Sunday', () => {
	const date = moment(new Date('2020-02-16T00:00:00')).utc();
	const nextClosed = ShopInstance.nextClosed(date);

	expect(nextClosed.format('DD-MM-YYYY h:mma')).toEqual('16-02-2020 12:00am');
});

test('nextClosed returns input DateTime when given DateTime is weekday after hours', () => {
	const date = moment(new Date('2020-02-17T19:00:00')).utc();
	const nextClosed = ShopInstance.nextClosed(date);

	expect(nextClosed.format('DD-MM-YYYY h:mma')).toEqual('17-02-2020 7:00pm');
});

test('nextClosed returns hours when given DateTime is Monday during opening hours', () => {
	const date = moment(new Date('2020-02-17T14:00:00')).utc();
	const nextClosed = ShopInstance.nextClosed(date);

	expect(nextClosed.format('DD-MM-YYYY h:mma')).toEqual('17-02-2020 5:00pm');
});