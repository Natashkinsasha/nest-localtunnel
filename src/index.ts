import {DynamicModule, ForwardReference, Module, Type} from "@nestjs/common";
import * as localtunnel from 'localtunnel';
import {ModuleRef} from "@nestjs/core";


@Module({})
export class TunnelModel {

    public static forRoot(port: number, opt?: localtunnel.TunnelConfig): DynamicModule {
        const providers = [
            {
                provide: 'Tunnel',
                useFactory: async () => {
                    return this.init(port, opt);
                },
            }
        ];
        return {
            module: TunnelModel,
            providers: providers,
            exports: providers,
        }
    }

    public static forRootAsync({useFactory, inject, imports}: { useFactory: (...args: any[]) => Promise<{ port: number, opt?: localtunnel.TunnelConfig } | void>, inject?: Array<Type<any> | string | symbol>, imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>; }): DynamicModule {
        const providers = [
            {
                provide: 'Tunnel',
                useFactory: async (ref: ModuleRef, ...inject: Array<Type<any> | string | symbol>) => {
                    return useFactory(...inject)
                        .then((answer) => {
                            if(answer){
                                return this.init(answer.port, answer.opt);
                            }
                            return;
                        })
                },
                inject: [ModuleRef, ...(inject || [])]
            }
        ];
        return {
            imports,
            module: TunnelModel,
            providers: providers,
            exports: providers,
        }
    }

    private static init(port: number, opt?: localtunnel.TunnelConfig): Promise<localtunnel.Tunnel> {
        return new Promise((resolve, reject) => {
            if (!opt) {
                return localtunnel(port, async (err, tunnel) => {
                    if (err) {
                        return reject(err);
                    }
                    if (tunnel) {
                        return resolve(tunnel);
                    }
                    throw new Error('Tunnel did not create.');
                });
            }
            return localtunnel(port, opt, async (err, tunnel) => {
                if (err) {
                    return reject(err);
                }
                if (tunnel) {
                    return resolve(tunnel);
                }
                throw new Error('Tunnel did not create.');
            });
        });
    }
}