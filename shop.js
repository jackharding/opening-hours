const moment = require('moment');

import holidays from './config/holidays.config';
import times from './config/times.config';

export default class Shop {

	/**
	 * Create an ISO string from hh:mm with either a chosen or arbitrary date
     *
     * @param {string} time
     * @param {string} date
     * @return {(string|boolean)}
     */

    makeISOStringFromTime(time, date) {
        date = date ? date.format('YYYY-MM-DD') : '2020-01-01';

        return `${date}T${time}:00.000Z`;
	}
	
	/**
	 * Create an ISO string from DD-MM-YYYY
     *
     * @param {string} date
     * @param {boolean} end
     * @return {string}
     */

    parseDateString(date, end) {
        return date.split('-').reverse().join('-') + `T${end ? '23:59:59' : '00:00:00'}.000Z`;
	}
	
	/**
	 * Find a holiday that's occuring during the given date
     *
     * @param {Date} date
     * @return {(Object|undefined)}
     */

    findActiveHoliday(date) {
        if(!date) {
            throw Error('You must provide a moment object to this function.')
        }

        return holidays.find(({ start, end, description }) => {
            start = moment(this.parseDateString(start)).utc().subtract(1, 'seconds');
            end = moment(this.parseDateString(end, true)).utc();

            const withinRange = date.isBetween(start, end);

            return withinRange;
        });
	}
	
	/**
	 * Split an opening hours object in to pairs of opening/closing times
     *
     * @param {Object} dayObject
     * @return {Array}
     */

    getStartEndTimePairs(dayObject) {
        if(!dayObject) return [];

        const hours = Object.keys(dayObject);

        return hours.reduce((acc, curr, index, array) => {
            if(index % 2 === 0) {
                acc.push(array.slice(index, index + 2));
            }

            return acc;
        }, []);
    }

	/**
	 * Get the time config object for the given date
     *
     * @param {Date} date
     * @return {(Object|boolean)}
     */

    dayHasOpenHours(date) {
        const currentDay = date.format('dddd');
        const dayTimes = times[currentDay];

        if(!dayTimes || !Object.entries(dayTimes).length) return false;

        return dayTimes;
	}
	
	/**
	 * Get the next opening hours for the given date
     *
     * @param {Date} date
     * @return {(Array|boolean)}
     */

    getDaysNextOpenHours(date) {
        if(!date) {
            throw Error('You must provide a moment object to this function.')
        }

        const dayTimes = this.dayHasOpenHours(date);

        if(!dayTimes) return false;

        const timePairs = this.getStartEndTimePairs(dayTimes);
        
        return timePairs.find(([start]) => {
            start = moment(this.makeISOStringFromTime(start, date)).utc();

            return date.isBefore(start);
        });
	}
	
	/**
	 * Find opening hours that are occuring during a given date
     *
     * @param {Date} date
     * @return {Array}
     */

    getDaysCurrentOpenHours(date) {
        if(!date) {
            throw Error('You must provide a moment object to this function.')
        }
        
        const dayTimes = this.dayHasOpenHours(date);

        if(!dayTimes) return false;

        const timePairs = this.getStartEndTimePairs(dayTimes);
        
        return timePairs.find(([start, end]) => {
            start = moment(this.makeISOStringFromTime(start, date)).utc().subtract(1, 'seconds');
            end = moment(this.makeISOStringFromTime(end, date)).utc();

            return date.isBetween(start, end);
        });
    }

	/**
	 * Get any current or future opening hours for a given date
     *
     * @param {Date} date
     * @return {Array}
     */
	
    getDaysOpenHours(date) {
        const isOpen = this.getDaysCurrentOpenHours(date);

        if(isOpen) return isOpen;

        const willBeOpen = this.getDaysNextOpenHours(date);

        return willBeOpen;
    }

    /**
	 * Get the next closing hours for the given date
     *
     * @param {Date} date
     * @return {(string|boolean)}
     */

    getDaysNextClosedHours(date) {
        const dayTimes = this.dayHasOpenHours(date);

        if(!dayTimes) return false;

        const timePairs = this.getStartEndTimePairs(dayTimes);
        
        const nextHours = timePairs.find(([start, end]) => {
            end = moment(this.makeISOStringFromTime(end, date)).utc();

            return date.isBefore(end);
        });

        return nextHours ? nextHours[1] : false;
    }

    /**
     * Is the shop open on the provided date/time
     * If provided a DateTime object, check relative to that, otherwise use now
     *
     * @param {Date} date
     * @return {boolean}
     */

    isOpen(date = new Date()) {
        date = moment(date).utc();

        const onHoliday = this.findActiveHoliday(date);
    
        if(onHoliday) return false;

        const isOpen = this.getDaysCurrentOpenHours(date);
        
        return isOpen;
    };


    /**
     * Is the shop closed on the provided date/time
     * If provided a DateTime object, check relative to that, otherwise use now
     *
     * @param {Date} date
     * @return {boolean}
     */

    isClosed(date = new Date()) {
        return !this.isOpen(date);
    };


    /**
     * At what date/time will the shop next be open
     * If provided a DateTime object, check relative to that, otherwise use now
     * If the shop is already open, return the provided datetime/now
     *
     * @param {Date} date
     * @return {Date} date
     */

    nextOpen(date = new Date()) {
        date = moment(date).utc();

        let isOpen = this.isOpen(date);
        
        if(isOpen) return date;

        while(this.findActiveHoliday(date) || !this.getDaysOpenHours(date)) {
            date = date.add(1, 'days');
            date.set({ h: 0, m: 0 });
        }
        
        let nextOpen = this.getDaysOpenHours(date);
		nextOpen = moment(this.makeISOStringFromTime(nextOpen[0], date)).utc();
        
        return nextOpen;
    };

    /**
     * At what date/time will the shop next be closed
     * If provided a DateTime object, check relative to that, otherwise use now
     * If the shop is already closed, return the provided datetime/now
     *
     * @param {Date} date
     * @return {Date} date
     */
    nextClosed(date = new Date()) {
        date = moment(date).utc();

        let isClosed = !this.isOpen(date);

        if(isClosed) return date;

        while(!this.findActiveHoliday(date) && !this.getDaysNextClosedHours(date)) {
            date = date.add(1, 'days');
            date.set({ h: 0, m: 0 });
        }

        let nextClosed = this.getDaysNextClosedHours(date);
        nextClosed = moment(this.makeISOStringFromTime(nextClosed, date)).utc();
        
        return nextClosed;
    };


}
