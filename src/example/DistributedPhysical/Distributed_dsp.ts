// Code generated by the Lingua Franca compiler from file:
// /Users/matt.weber/git/lingua-franca/example/DistributedTS/Distributed.lf

import {Args, Present, Parameter, State, Variable, Priority, Mutation, Read, Triggers, ReadWrite, Write, Named, Reaction, Action, Startup, Schedule, Timer, Reactor, Port, OutPort, InPort, App, FederatedApp} from '../../core/reactor'
import {TimeUnit, TimeValue, UnitBasedTimeValue, Tag, Origin} from '../../core/time'
import {Log} from '../../core/util'
import {ProcessedCommandLineArgs, CommandLineOptionDefs, CommandLineUsageDefs, CommandLineOptionSpec, unitBasedTimeValueCLAType, booleanCLAType} from '../../core/cli'

// ************* App Parameters
let __timeout: TimeValue | undefined = new UnitBasedTimeValue(10, TimeUnit.secs);
let __keepAlive: boolean = true;
let __fast: boolean = false;

let __noStart = false; // If set to true, don't start the app.

// Assign custom command line arguments
// =============== START reactor class MessageGenerator
export class MessageGenerator extends Reactor {
    t: Timer;
    root: Parameter<string>;
    count: State<number>;
    message: OutPort<string>;
    constructor (
        parent: Reactor, 
        root: string = ""
    ) {
        super(parent);
        this.t = new Timer(this, new UnitBasedTimeValue(1, TimeUnit.sec), new UnitBasedTimeValue(1, TimeUnit.sec));
        this.root = new Parameter(root);
        this.count = new State(1);
        this.message = new OutPort<string>(this);
        this.addReaction(
            new Triggers(this.t),
            new Args(this.t, this.getWriter(this.message), this.root, this.count),
            function (this, __t: Read<Tag>, __message: ReadWrite<string>, __root: Parameter<string>, __count: State<number>) {
                // =============== START react prologue
                const util = this.util;
                let t = __t.get();
                let message = __message.get();
                let root = __root.get();
                let count = __count.get();
                // =============== END react prologue
                try {
                    message = count.toString();    
                    console.log(`At time ${util.getElapsedLogicalTime()}, send message: ${count++}`);
                } finally {
                    // =============== START react epilogue
                    if (message !== undefined) {
                        __message.set(message);
                    }
                    if (count !== undefined) {
                        __count.set(count);
                    }
                    // =============== END react epilogue
                }
            }
        );
    }
}
// =============== END reactor class MessageGenerator

// =============== START reactor class PrintMessage
export class PrintMessage extends Reactor {
    message: InPort<string>;
    constructor (
        parent: Reactor
    ) {
        super(parent);
        this.message = new InPort<string>(this);
        this.addReaction(
            new Triggers(this.message),
            new Args(this.message),
            function (this, __message: Read<string>) {
                // =============== START react prologue
                const util = this.util;
                let message = __message.get();
                // =============== END react prologue
                try {
                    console.log(`PrintMessage: At (elapsed) logical time ${util.getElapsedLogicalTime()}, receiver receives: ${message}`);
                } finally {
                    // =============== START react epilogue
                    
                    // =============== END react epilogue
                }
            }
        );
    }
}
// =============== END reactor class PrintMessage

// =============== START reactor class Distributed
export class Distributed extends FederatedApp {
    dsp: PrintMessage
    networkMessage: Action<string>;
    constructor (
        timeout: TimeValue | undefined = undefined, 
        keepAlive: boolean = false, 
        fast: boolean = false, 
        success?: () => void, 
        fail?: () => void
    ) {
        super(1, 15044, "localhost", timeout, keepAlive, fast, success, fail);
        this.dsp = new PrintMessage(this)
        this.networkMessage = new Action<string>(this, Origin.physical, new UnitBasedTimeValue(10, TimeUnit.msec));
        this.registerFederatePortAction(0, this.networkMessage);
        this.addReaction(
            new Triggers(this.networkMessage),
            new Args(this.networkMessage, this.getWriter(this.dsp.message)),
            function (this, __networkMessage: Read<string>, __dsp_message: ReadWrite<string>) {
                // =============== START react prologue
                const util = this.util;
                let networkMessage = __networkMessage.get();
                let dsp = {message: __dsp_message.get()}
                // =============== END react prologue
                try {
                    // FIXME: For now assume the data is a string, but this is not checked.
                    // Replace with ProtoBufs or MessagePack.
                    if (networkMessage !== undefined) {
                        dsp.message = networkMessage.toString(); // defaults to utf8 encoding
                    }
                } finally {
                    // =============== START react epilogue
                    if (dsp.message !== undefined) {
                        __dsp_message.set(dsp.message)
                    }
                    // =============== END react epilogue
                }
            }
        );
    }
}
// =============== END reactor class Distributed

// ************* Instance Distributed of class Distributed
let __app;
if (!__noStart) {
    __app = new Distributed(__timeout, __keepAlive, __fast, );
}
// ************* Starting Runtime for Distributed + of class Distributed.
if (!__noStart && __app) {
    __app._start();
}
