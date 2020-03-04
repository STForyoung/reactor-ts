import {TimeValue, TimeUnit, Tag, UnitBasedTimeValue} from "./time";

/**
 * Test of helper functions for time in reactors
 */
describe('time representation', function () {
    
    // Zero time intervals.
    const straightZero: TimeValue = new TimeValue(0);
    const zeroSeconds: TimeValue = new UnitBasedTimeValue(0, TimeUnit.sec);
    const zeroNS: TimeValue = new UnitBasedTimeValue(0, TimeUnit.nsec);
    const zeroWeeks: TimeValue = new UnitBasedTimeValue(0, TimeUnit.week);

    // Non-zero time intervals.
    const fiveSeconds: TimeValue = new UnitBasedTimeValue(5, TimeUnit.sec);
    const fiveSFiveUS: TimeValue = new UnitBasedTimeValue(5000005, TimeUnit.usec);
    const fortyTwoDays: TimeValue = new UnitBasedTimeValue(42, TimeUnit.days);
    const threeHundredUS: TimeValue = new UnitBasedTimeValue(300, TimeUnit.usec);
    const sevenPointFiveBillNS: TimeValue = new UnitBasedTimeValue(7500000000, TimeUnit.nsec);
    const twoHundredFiftyMillMS: TimeValue = new UnitBasedTimeValue(250000000, TimeUnit.msec);
    const fiveHundredMilNS: TimeValue = new UnitBasedTimeValue(500000000, TimeUnit.nsec);
    const oneThousandMS: TimeValue = new UnitBasedTimeValue(1000, TimeUnit.msec);
    const aboutTenYears: TimeValue = new UnitBasedTimeValue(365 * 10, TimeUnit.day);

    // Time instants.
    const tiFiveSeconds0:Tag = new Tag(fiveSeconds, 0);
    const tiFiveSeconds1:Tag = new Tag(fiveSeconds, 1);

    const tiZero:Tag = new Tag(straightZero, 0);
    const tiZero1:Tag = new Tag(straightZero, 1);
    const tiOne1:Tag = new Tag(new TimeValue(1), 1);
    const tiOneNano1:Tag = new Tag(new TimeValue(0,1), 1);
    
    /**
     * Test to see if the zero representations for time intervals 
     * are correctly identified by the timeIntervalIsZero function.
     */
    it('timeIntervalIsZero', function () {
        
        expect( straightZero.isZero()).toBe(true);
        expect( zeroSeconds.isZero()).toBe(true);
        expect( zeroNS.isZero()).toBe(true);
        expect( zeroWeeks.isZero()).toBe(true);
        expect( fiveSeconds.isZero()).toBe(false);
        expect( fortyTwoDays.isZero()).toBe(false);
        expect( threeHundredUS.isZero()).toBe(false);
        expect( sevenPointFiveBillNS.isZero()).toBe(false);
        expect( twoHundredFiftyMillMS.isZero()).toBe(false);
        expect( fiveHundredMilNS.isZero()).toBe(false);
        expect( oneThousandMS.isZero()).toBe(false);

    });

    /**
     * Create time intervals by specifying a time value and time unit.
     */
    it('unitBasedTimeIntervals', function () {

        // Creating time intervals with a non-integer 
        // time value results in an error.
        expect(() => {
            new UnitBasedTimeValue(0.1, TimeUnit.sec);
        }).toThrowError()

        expect(zeroSeconds.isEqualTo(straightZero)).toBeTruthy();
        expect(zeroSeconds.isEqualTo(zeroNS)).toBeTruthy();
        expect(zeroSeconds.isEqualTo(zeroWeeks)).toBeTruthy();

        expect(oneThousandMS.isEqualTo(new TimeValue(1, 0)));
        expect(threeHundredUS.isEqualTo(new TimeValue(1, 300000)));
        expect(fiveSFiveUS.isEqualTo(new TimeValue(5, 5000)));
        expect(threeHundredUS.isEqualTo(new TimeValue(0, 300000)));
        expect(sevenPointFiveBillNS.isEqualTo(new TimeValue(7, 500000000)));
        expect(twoHundredFiftyMillMS.isEqualTo(new TimeValue(250000, 0)));
        expect(fiveHundredMilNS.isEqualTo(new TimeValue(0, 500000000)));
        expect(oneThousandMS.isEqualTo(new TimeValue(1, 0)));
        expect(aboutTenYears.isEqualTo(new TimeValue(10 * 365 * 24 * 60 * 60 , 0)));

        // This test should generate an error because we're trying to convert
        // a number which can't be represented as a numeric time interval.
        expect(() => {
            new UnitBasedTimeValue(Number.MAX_SAFE_INTEGER, TimeUnit.weeks);
        }).toThrowError();

    });

    /**
     * Test whether time intervals are equal.
     */
    it('TestEqualTimeIntervals', function () {
        expect(fiveSeconds.isEqualTo(fiveSeconds)).toBeTruthy();
        expect(fiveSeconds.isEqualTo(fortyTwoDays)).toBeFalsy();
        expect(fortyTwoDays.isEqualTo(fiveSeconds)).toBeFalsy();
        expect(fiveSFiveUS.isEqualTo(fiveSeconds)).toBeFalsy();
        expect(fiveSeconds.isEqualTo(fiveSFiveUS)).toBeFalsy();
    });

    /**
     * Report whether one time instant is ealier than another one.
     * Microstep indices are taken into consideration.
     */
    it('compareTimeInstants', function () {
        expect(tiZero.isEarlierThan(tiZero)).toBeFalsy();
        expect(tiZero.isEarlierThan(tiZero1)).toBeTruthy();
        expect(tiZero1.isEarlierThan(tiZero)).toBeFalsy();

        expect(tiFiveSeconds0.isEarlierThan(tiFiveSeconds0)).toBeFalsy();
        expect(tiFiveSeconds0.isEarlierThan(tiFiveSeconds1)).toBeTruthy();
        expect(tiFiveSeconds1.isEarlierThan(tiFiveSeconds0)).toBeFalsy();

        expect(tiZero.isEarlierThan(tiFiveSeconds0)).toBeTruthy();
        expect(tiZero.isEarlierThan(tiFiveSeconds1)).toBeTruthy();
        expect(tiZero1.isEarlierThan(tiFiveSeconds0)).toBeTruthy();
        expect(tiZero1.isEarlierThan(tiFiveSeconds1)).toBeTruthy();
        
        expect(tiFiveSeconds0.isEarlierThan(tiZero)).toBeFalsy();
        expect(tiFiveSeconds1.isEarlierThan(tiZero)).toBeFalsy();
        expect(tiFiveSeconds0.isEarlierThan(tiZero1)).toBeFalsy();
        expect(tiFiveSeconds1.isEarlierThan(tiZero1)).toBeFalsy();

    });

    /**
     * Test simultaneity of time instants.
     */
    it('timeInstantsAreEqual', function(){
        expect(tiZero.isSimultaneousWith(tiZero1)).toBeFalsy();
        expect(tiZero1.isSimultaneousWith(tiZero1)).toBeTruthy();
        expect(tiOne1.isSimultaneousWith(tiZero1)).toBeFalsy();
        expect(tiOneNano1.isSimultaneousWith(tiOneNano1)).toBeTruthy();
    });

    /**
     * Add a time interval to a time instant and obtain a new time instant.
     */
    it('getLaterTime' , function () {
        expect(new Tag(fiveHundredMilNS, 0).getLaterTag(fortyTwoDays).isSimultaneousWith(new Tag(new TimeValue(42 * 24 * 60 * 60, 500000000), 0))).toBeTruthy();
        expect(new Tag(fiveHundredMilNS, 0).getLaterTag(fiveHundredMilNS).isSimultaneousWith(new Tag(new TimeValue(1, 0), 0))).toBeTruthy();
        expect(new Tag(oneThousandMS, 0).getLaterTag(straightZero).isSimultaneousWith(new Tag(oneThousandMS, 0))).toBeTruthy();
        expect(new Tag(oneThousandMS, 1).getLaterTag(straightZero).isSimultaneousWith(new Tag(oneThousandMS, 1))).toBeTruthy();
    });

    /**
     * Get a time interval in a format that is understood by nanotimer.
     */
    it('getNanoTime', function() {
        expect(fiveSeconds.getNanoTime()).toEqual("5s");
        expect(straightZero.getNanoTime()).toEqual("0s");
        expect(fiveSFiveUS.getNanoTime()).toEqual("5000005u");
        expect(new TimeValue(5, 5000000).getNanoTime()).toEqual("5005m");
        expect(new TimeValue(5, 5).getNanoTime()).toEqual("5000000005n");
        expect(fortyTwoDays.getNanoTime()).toEqual("3628800s");
        expect(threeHundredUS.getNanoTime()).toEqual("300u");
        expect(sevenPointFiveBillNS.getNanoTime()).toEqual("7500m");
        expect(twoHundredFiftyMillMS.getNanoTime()).toEqual("250000s");
        expect(fiveHundredMilNS.getNanoTime()).toEqual("500m");
        expect(oneThousandMS.getNanoTime()).toEqual("1s");
        expect(aboutTenYears.getNanoTime()).toEqual("315360000s");
    })

    /**
     * Obtain the difference between two time instants.
     * Microstep indices are ignored in this operation 
     * (time intervals don't have a microstep).
     */
    it('getTimeDifference', function() {
        expect(tiFiveSeconds0.getTimeDifference(tiFiveSeconds0)).toEqual(new TimeValue(0));
        expect(tiFiveSeconds0.getTimeDifference(tiFiveSeconds1)).toEqual(new TimeValue(0));
        expect(tiFiveSeconds0.getTimeDifference(tiOne1)).toEqual(new TimeValue(4));
        expect(tiOne1.getTimeDifference(tiFiveSeconds0)).toEqual(new TimeValue(4));
    });

    /**
     * See if expected errors happen.
     */
    it('errors', function() {
        expect(() => {
            expect(new TimeValue(4.3, 2.1));
        }).toThrowError()
    
        expect(() => {
            expect(new UnitBasedTimeValue(-1, TimeUnit.week));
        }).toThrowError()
    
        expect(() => {
            expect(new TimeValue(2,1).subtract(new TimeValue(4, 3)));
        }).toThrowError()
    });

});