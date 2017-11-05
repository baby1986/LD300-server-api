/**
 * Created by Luky on 2017/6/24.
 */
const _=require('lodash');
const expect = require('chai').expect;
const SerialPort=require('../../app/serialport/serialport');
const Host=require('../../app/host/host');
const util=require('util');
const vHost=require('./virtual_host');
//真实测试中使用的端口

let vHostPort='\\\\.\\COM1';
let hostPort='\\\\.\\COM2';

function expectEmitData(data,id,type){
    expect(data.hid).equal(id);
    expect(data.type).equal(type);
    expect(_.isNumber(data.id-0)).equal(true);
}

describe('模拟测试，请打开1,2串口',()=>{
    describe('打开及正常信号',()=> {
        let port;
        let loopID=0;
        before((done)=>{
            port=new SerialPort(vHostPort,vHost.portOptions);
            port.connect().then(done).catch(done);
            loopID=setInterval(()=>{
                port.write(vHost.cmds[0]);
            },200);
        });

        it('打开设备测试发送rdady信号,关闭设备',(done)=>{
            const host=new Host(2,hostPort);
            let rdata=(data)=>{
                expect(data.equals(Buffer.from([0]))).equal(true);
                port.removeListener('data',rdata);
            };
            port.on('data',rdata);
            host.on(Host.Events.Open,(data)=>{
                expectEmitData(data,2,Host.Events.Open);
            });

            let state=Host.States.Unknown;
            let sc=(data)=>{
                expectEmitData(data,2,Host.Events.StateChanged);
                expect(data.stateOld).equal(state);
                if(state===Host.States.Unknown){
                    expect(data.stateNew).equal(Host.States.Normal);
                    expect(host.state).equal(Host.States.Normal);
                    state=data.stateNew;
                }
                else if(state===Host.States.Normal){
                    host.removeListener(Host.Events.StateChanged,sc);
                    expect(data.stateNew).equal(Host.States.SysReady);
                    expect(host.state).equal(Host.States.SysReady);
                    clearInterval(loopID);
                    host.disConnect().catch(done);
                }
                else{
                    expect(1).equal(2);
                    return;
                }
            };
            host.on(Host.Events.StateChanged,sc);

            host.on(Host.Events.Close,(data)=>{
                expectEmitData(data,2,Host.Events.Close);
                done();
            });
            host.connect();
        });

        after((done)=>{
            port.disConnect().then(done).catch(done);
        });
    });

    describe('报警信号',()=>{
        let port;
        before((done)=>{
            port=new SerialPort(vHostPort,vHost.portOptions);
            port.connect().then(done).catch(done);
        });
        it('接受警报771米',(done)=>{
            const host=new Host(2,hostPort);
            host.on(Host.Events.Open,()=>{
                port.write(vHost.cmds[1]);
            });
            host.on(Host.Events.StateChanged,(data)=>{
                expectEmitData(data,2,Host.Events.StateChanged);
                if(data.stateNew!==Host.States.Alarm){
                    return;
                }
                expect(host.state).equal(Host.States.Alarm);
                expect(data.stateNew).equal(Host.States.Alarm);
                expect(data.position).equal(771);
                host.disConnect().then(done).catch(done);
            });
            host.connect();
        });
        it('报警解除',(done)=>{
            const host=new Host(2,hostPort);
            host.connect();
            port.on('data',(data)=>{
               if(data[0]===0)return;
               expect(data.equals(Buffer.from([0xAA]))).equal(true);
               host.disConnect().then(done).catch(done);
            });
            setTimeout(()=>{
                host.clearAlarm().catch(done);
            },100);
        });

        it('报警接触后复位信号',(done)=>{
            const host=new Host(2,hostPort);
            host.on(Host.Events.Open,()=>{
                expect(host.state).equal(Host.States.Unknown);
                port.write(vHost.cmds[1]);
            });
            host.on(Host.Events.StateChanged,(data)=>{
                if(data.stateNew===Host.States.Alarm){
                    expect(host.state).equal(Host.States.Alarm);
                    port.write(vHost.cmds[0]);
                }
                if(data.stateNew===Host.States.SysReady){
                    expect(host.state).equal(Host.States.SysReady);
                    host.disConnect().then(done).catch(done);
                }
            });
            host.connect();
        });

        after((done)=>{
            port.disConnect().then(done).catch(done);
        });
    });

    describe('主机返回错误信号',()=>{
        let port;
        before((done)=>{
            port=new SerialPort(vHostPort,vHost.portOptions);
            port.connect().then(done).catch(done);
        });

        it('initError',(done)=>{
            setTimeout(()=>{
                port.write(vHost.cmds[2]);
            },400);
            const host=new Host(2,hostPort);
            host.on(Host.Events.StateChanged,(data)=>{
                if(data.stateNew===Host.States.Error){
                    expect(host.state).equal(Host.States.Error);
                    expectEmitData(data,2,Host.Events.StateChanged);
                    expect(data.errorType).equal(Host.Errors.InitError);
                    host.disConnect().then(done).catch(done);
                }
            });
            host.connect();
        });

        it('connectnitError',(done)=>{
            setTimeout(()=>{
                port.write(vHost.cmds[3]);
            },400);
            const host=new Host(2,hostPort);
            host.on(Host.Events.StateChanged,(data)=>{
                if(data.stateNew===Host.States.Error) {
                    expectEmitData(data, 2, Host.Events.StateChanged);
                    expect(host.state).equal(Host.States.Error);
                    expect(data.errorType).equal(Host.Errors.ConnectError);
                    host.disConnect().then(done).catch(done);
                }
            });
            host.connect();
        });

        after((done)=>{
            port.disConnect().then(done).catch(done);
        });
    });

    describe('小测端口错误传递',()=>{
       it('绑定不存在的13端口-Offline测试',(done)=>{
           const host=new Host(2,13);
           host.on(Host.Events.Offline,(data)=>{
               expect(host.state).equal(Host.States.Unknown);
               expectEmitData(data,2,Host.Events.Offline);
               expect(data.innerEvent.port).equal('\\\\.\\COM13');
               done();
           });
           host.connect();
       });
    });
});