import {App} from '../reactor';
import {TimeInterval} from "../time"
import {ActionTrigger} from '../components/ActionTrigger';

class ActionTriggerTest extends App {
    aTrigger: ActionTrigger;

    constructor(name: string, timeout: TimeInterval, success?: ()=> void, fail?: ()=>void){
        super(timeout, success, fail);
        this.setAlias(name);
        this.aTrigger = new ActionTrigger(this);
    }
}

describe('ActionTrigger', function () {

    // Ensure the test will run for no more than 5 seconds.
    jest.setTimeout(5000);

    it('start runtime', done => {

        function failure(){
            throw new Error("Reactor has failed.");
        };

        //Tell the reactor runtime to successfully terminate after 3 seconds.
        var aTriggerTest = new ActionTriggerTest("ActionTriggerTest", new TimeInterval(3), done, failure);
        //Don't give the runtime the done callback because we don't care if it terminates
        aTriggerTest._start();

    })
});