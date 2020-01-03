import {OutPort, App, Timer, Reaction, Writable} from '../reactor';
import {TimeInterval} from "../time";

class OutputGetTest extends App {

    o: OutPort<number> = new OutPort<number>(this);
    t: Timer = new Timer(this, 0, 0);
    
    constructor(timeout: TimeInterval, name:string, success: ()=> void, failure: ()=>void){
        super(timeout, success, failure);
        this.setAlias(name);
        this.addReaction(new OutputGetter(this, [this.t], this.check(this.getWritable(this.o))));
    }
}

class OutputGetter<T> extends Reaction<T> {

    //@ts-ignore
    react(o: Writable<number>) {
        if(o.get() != null){
            throw new Error("Calling get on an output before it has been set does not return null");
        }
        o.set(5);
        if(o.get() !== 5){
            throw new Error("Calling get on an output after it has been set does not return the set value");
        }
        this.parent.util.success();
    }
}

// This test shows that a value may be obtained from an OutPort via get()
// once it has been set()
describe('OutputGetTest', function () {

    //Ensure the test will run for 5 seconds.
    jest.setTimeout(5000);

    it('start runtime', done => {
        console.log("starting test");

        function fail(){
            throw new Error("Test has failed.");
        };

        //Tell the reactor runtime to successfully terminate after 3 seconds.
        var oGetTest = new OutputGetTest(new TimeInterval(3), "OutputGetTest", done, fail);
        
        //Don't give the runtime the done callback because we don't care if it terminates
        oGetTest._start();
    })
});