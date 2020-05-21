import {Reactor, Reaction, Priority, App, Triggers, InPort, Args, ArgList, Startup, Shutdown, CalleePort, CallerPort, Port, Present, OutPort, Action, Timer} from '../src/core/reactor';
import { UnitBasedTimeValue, TimeUnit, TimeValue, Origin } from '../src/core/time';
import { Log, LogLevel, SortableDependencyGraph, Sortable } from '../src/core/util';
import { doesNotMatch } from 'assert';

/* Set a port in startup to get thing going */
class Starter extends Reactor {
    public out = new OutPort<number>(this);

    constructor(parent: Reactor|null) {
        super(parent);
        this.addReaction(
            new Triggers(this.startup),
            new Args(this.writable(this.out)),
            function(this, __out) {
                __out.set(4);

            }
        );
    }

}

/* A reactor with a deadline in its constructor */
class R1 extends Reactor {
    public in = new InPort<number>(this);
    public out = new OutPort<number>(this);

    constructor(parent: Reactor|null, deadline: TimeValue, deadlineMiss?: () => void) {
        super(parent);
        this.addReaction(
            new Triggers(this.in),
            new Args(this.in, this.writable(this.out)),
            function(this, __in, __out) {
                const util = this.util
                let initialElapsedTime = util.getElapsedPhysicalTime();
                let tmp = __in.get();
                
                if(tmp)
                {
                    console.log("Recieved "+tmp.toString());
                }

                let out: number = 0;

                try {                        
                    // let sleep_time =  new UnitBasedTimeValue(2, TimeUnit.sec);
                    // let startTime = util.getCurrentPhysicalTime();
                    // let finishTime = startTime.add(sleep_time)
                    // // Busy wait
                    // while(util.getCurrentPhysicalTime().isEarlierThan(finishTime));
                    
                    while (util.getElapsedPhysicalTime().isEarlierThan(initialElapsedTime.add(new UnitBasedTimeValue(1, TimeUnit.sec))));
                
                } finally {
                    
                    if(tmp)
                    {
                     out = tmp + 4;
                    }
                    if(out){
                        console.log("Sending "+out.toString())
                        __out.set(out);
                    }
                }

            },
            deadline,
            deadlineMiss


        );
    }



}

class R2 extends Reactor {
    public in = new InPort<number>(this);

    constructor(parent: Reactor|null, deadline?: TimeValue, deadlineMiss?: () => void) {
        super(parent);
        this.addReaction(
            new Triggers(this.in),
            new Args(this.in),
            function(this, __in) {
                let tmp = __in.get();
                /* Do Nothing */   
                try
                {            
                    if(tmp)
                    {
                        console.log("Received "+tmp.toString());
                    }
                } finally {

                }
            },
            deadline,
            deadlineMiss

        );
    }

}

class testApp extends App {
    start: Starter
    reactor1: R1;
    reactor2: R2;

    constructor (name: string, timeout: TimeValue, success?: () => void, fail?: () => void, deadlineMiss?: () => void, secondTimeout?: TimeValue) {
        super(timeout, false, false, success, fail);
        this.start = new Starter(this);
        this.reactor1 = new R1(this, timeout, deadlineMiss);
        this.reactor2 = new R2(this, secondTimeout, deadlineMiss);
        this._connect(this.start.out, this.reactor1.in)
        this._connect(this.reactor1.out, this.reactor2.in)
    }
}


class ReactorWithAction extends App {
    a = new Action<number>(this, Origin.logical);
    t = new Timer(this, new UnitBasedTimeValue(1, TimeUnit.msec), new TimeValue(1, TimeUnit.sec))
    
    
    constructor (name: string, timeout: TimeValue, success?: () => void, fail?: () => void, deadlineMiss?: () => void) {
        super(timeout, false, false, success, fail);
        this.addReaction(
            new Triggers(this.t),
            new Args(this.schedulable(this.a)),
            function(this, a){
                a.schedule(0, 1);
            }
        );
    }

}




describe("Testing deadlines", function () {

    jest.setTimeout(5000);

    it("Missed reaction deadline on InPort", done => {
        Log.global.level = LogLevel.WARN

        function fail() {
            throw new Error("Test has failed.");
        };
        
        let app = new testApp("testApp", new TimeValue(1,TimeUnit.nsec), done, fail)

        // spyOn(app, '_start').and.callThrough

        // expect(() => {app._start()}).toThrowError("Deadline violation occurred!");

        /* FIXME: Deadlines are not working */
        app._start();
    });

    it("Missed reaction deadline on the second reaction in the chain", done => {

        // let consoleOutput: string[] = []

        Log.global.level = LogLevel.WARN

        function fail() {
            throw new Error("Test has failed.");
        };
        
        let app = new testApp("testApp", new TimeValue(1,TimeUnit.nsec), done, fail, undefined, new TimeValue(1,TimeUnit.nsec))

        // const spy = jest.spyOn(global.console, 'warn').mockImplementation(warn => {
        //         consoleOutput.push(warn); 
        //         global.console.error("Deadline missed!");
        //         done();
        //     }
        //     );

        app._start();

        
        // expect(consoleOutput).toEqual(["Deadline missed!"]);

        // spy.mockRestore()
    });


    it("Missed deadline with custom message", done => {
        Log.global.level = LogLevel.WARN

        //let deadlineMissed:string = ""

        function fail() {
            throw new Error("Test has failed.");
        };
        
        let app = new testApp("testApp", new TimeValue(1,TimeUnit.nsec), done , fail, () => {Log.global.warn("Deadline missed!");},  new TimeValue(1,TimeUnit.nsec))

        /* FIXME: Find a way to trigger deadline misses */
       app._start();

        // expect(deadlineMissed).toEqual("Deadline missed!");

        //expect(consoleOutput).toEqual(expect.arrayContaining(expect.objectContaining('Deadline missed!')));
        //expect(consoleOutput).toContain('Deadline missed!');
    });


});


describe("Testing Reactions", function () {

    it("Manually call reactions", () => {
        let app = new testApp("testApp", new TimeValue(5000,TimeUnit.msec), () => {}, fail)

        /* FIXME: Find a way to manually test reactors */
        /* let reactions = app.reactor1._getReactions();

        reactions.forEach( function (reaction) {
            reaction.doReact();
        });
 */
    });

    it("Mutate a reaction", () => {

    });

});

describe("Testing Actions", function () {

        it("Mismatched logical time", () => {
            Log.global.level = LogLevel.WARN

            function fail() {
                throw new Error("Test has failed.");
            };
            
            /* FIXME: Deadlines are not working. Jest throws timeout error before LF */
            // let app = new ReactorWithAction("testApp", new TimeValue(1,TimeUnit.sec), done, fail)

            
           
    
            /* FIXME: Deadlines are not working */
           // app._start();
        });

});



