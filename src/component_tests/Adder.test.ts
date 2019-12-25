import {Adder} from '../components/Adder';
import {App, Port} from '../reactor';
import {TimeInterval} from '../time';

class MyAdder extends Adder {
    public fire() {
        for (let r of this._reactions) {
            r.doReact();
        }
    }

    public getWriter(port: Port<unknown>) {
        return this.getWritable(port);
    }
}

var app = new App(new TimeInterval(0));

describe('adder', function () {
    
    var adder = new MyAdder(app, "MyAdder");

    it('2 + 1 = 3', function () {

        expect(adder).toBeInstanceOf(Adder);
        adder.getWriter(adder.in1).set(2);
        adder.getWriter(adder.in2).set(1);
        adder.fire();
        expect(adder.out.get()).toBe(3);
    });
});
