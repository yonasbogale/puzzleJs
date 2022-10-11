import {expect} from "chai";
import {GatewayStorefrontInstance} from "../src/gatewayStorefront";
import {DEFAULT_MAIN_PARTIAL, EVENTS, FRAGMENT_RENDER_MODES} from "../src/enums";
import {HandlerDataResponse, IGatewayBFFConfiguration} from "../src/types";
import nock from "nock";
import {createExpressMock, createGateway} from "./mock/mock";
import {GatewayBFF} from "../src/gatewayBFF";
import {GatewayConfigurator} from "../src/configurator";
import {DEFAULT_POLLING_INTERVAL} from "../src/config";
import faker from "faker";
import request from "supertest";
import {RESOURCE_LOADING_TYPE, RESOURCE_TYPE} from "@puzzle-js/client-lib/dist/enums";

describe('Gateway', () => {
    describe('BFF', () => {
        const commonGatewayConfiguration: IGatewayBFFConfiguration = {
            name: 'Browsing',
            api: [],
            fragments: [],
            isMobile: true,
            serverOptions: {
                port: 4446
            },
            url: 'http://localhost:4446/',
            fragmentsFolder: '',
        };

        it('should create new gateway', () => {
            const gatewayConfiguration = {
                name: 'Browsing',
                url: 'http://localhost:4446/'
            };

            const browsingGateway = new GatewayStorefrontInstance(gatewayConfiguration);
            expect(browsingGateway.name).to.eq(gatewayConfiguration.name);
            expect(browsingGateway.url).to.eq(gatewayConfiguration.url);
        });

        it('should create new gateway with configurator', () => {
            const gatewayConfigurator = new GatewayConfigurator();

            gatewayConfigurator.config({
                name: 'Browsing',
                api: [],
                fragments: [],
                isMobile: true,
                serverOptions: {
                    port: 4446
                },
                url: 'http://localhost:4446/',
                fragmentsFolder: ''
            });

            const browsingGateway = new GatewayBFF(gatewayConfigurator);
            expect(browsingGateway.name).to.eq(gatewayConfigurator.configuration.name);
            expect(browsingGateway.url).to.eq(gatewayConfigurator.configuration.url);
        });

        it('should create new gateway BFF instance', () => {
            const bffGw = new GatewayBFF(commonGatewayConfiguration);
            expect(bffGw).to.be.instanceOf(GatewayBFF);
        });

        it('should create new gateway BFF instance with auth token', () => {
            commonGatewayConfiguration.authToken = 'Secret Key';
            const bffGw = new GatewayBFF(commonGatewayConfiguration);
            expect(bffGw).to.be.instanceOf(GatewayBFF);
        });

        it('should create a new gateway bff instance with single fragment', () => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            }
                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);
            expect(bffGw).to.be.instanceOf(GatewayBFF);
        });

        it('should expose public configuration reduced', () => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            },
                            'test2': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test2')
                            }
                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);

            expect(bffGw.exposedConfig).to.deep.include({
                fragments: {
                    'boutique-list': {
                        assets: [],
                        prg: false,
                        dependencies: [],
                        render: {
                            url: '/'
                        },
                        version: 'test',
                        testCookie: 'fragment_test',
                        passiveVersions: {
                            test2: {
                                assets: [],
                                dependencies: []
                            }
                        }
                    }
                }
            });
            expect(bffGw.exposedConfig.hash).to.be.a('string');
        });

        it('should expose public configuration reduced with cookieMatcher', () => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versionMatcher: (cookies: any) => '1.0.0',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            },
                            'test2': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test2')
                            }
                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);

            expect(bffGw.exposedConfig).to.deep.include({
                fragments: {
                    'boutique-list': {
                        assets: [],
                        prg: false,
                        dependencies: [],
                        versionMatcher: `(cookies) => '1.0.0'`,
                        render: {
                            url: '/'
                        },
                        version: 'test',
                        testCookie: 'fragment_test',
                        passiveVersions: {
                            test2: {
                                assets: [],
                                dependencies: []
                            }
                        }
                    }
                }
            });
            expect(bffGw.exposedConfig.hash).to.be.a('string');
        });

        it('should expose public configuration reduced with warden', () => {
            const wardenConf = {
                identifier: faker.random.word(),
                cache: faker.random.boolean(),
                holder: faker.random.boolean()
            };
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        warden: wardenConf,
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            },
                            'test2': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test2')
                            }
                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);

            expect(bffGw.exposedConfig).to.deep.include({
                fragments: {
                    'boutique-list': {
                        assets: [],
                        prg: false,
                        dependencies: [],
                        warden: wardenConf,
                        render: {
                            url: '/'
                        },
                        version: 'test',
                        testCookie: 'fragment_test',
                        passiveVersions: {
                            test2: {
                                assets: [],
                                dependencies: []
                            }
                        }
                    }
                }
            });
            expect(bffGw.exposedConfig.hash).to.be.a('string');
        });

        it('should return public information of given fragment', (done) => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            },
                            'test2': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test2')
                            }
                        }
                    }
                ],
                serverOptions: {
                    port: 4440
                },
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);

            bffGw.init( () => {
                request(bffGw.server.handler.getApp())
                    .get('/?fragment=boutique-list')
                    .expect(200)
                    .end((err, res) => {

                        expect(res.body).to.deep.eq({
                            version: 'test',
                            assets: [],
                            dependencies: [],
                            passiveVersions: {
                                test2: {
                                    assets: [],
                                    dependencies: [],
                                }
                            }
                        });

                        bffGw.server.close( () => {
                            done(err);
                        });
                    });
            });
        });

        it('should return 404, when requesting public information of non existing fragment', (done) => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            },
                            'test2': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test2')
                            }
                        }
                    }
                ],
                serverOptions: {
                    port: 4440
                },
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);

            bffGw.init( () => {
                request(bffGw.server.handler.getApp())
                    .get('/?fragment=boutique-list-not-exist')
                    .expect(404)
                    .end(err => {
                        bffGw.server.close( () => {
                            done(err);
                        });
                    });
            });
        });

        it('should render fragment in stream mode', async () => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            }
                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);
            await bffGw.renderFragment({} as any, 'boutique-list', FRAGMENT_RENDER_MODES.STREAM, DEFAULT_MAIN_PARTIAL, createExpressMock({
                json: (gwResponse: HandlerDataResponse) => {
                    if (!gwResponse) throw new Error('No response from gateway');
                    expect(gwResponse.main).to.eq('test');
                }
            }) as any,{});
        });

        it('should render fragment in preview mode', async () => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            }
                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);
            await bffGw.renderFragment({} as any, 'boutique-list', FRAGMENT_RENDER_MODES.PREVIEW, DEFAULT_MAIN_PARTIAL, createExpressMock({
                send: (gwResponse: string) => {
                    if (!gwResponse) throw new Error('No response from gateway');
                    expect(gwResponse).to.include(`<title>Browsing - boutique-list</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></head><body><div id="boutique-list">test</div></body></html>`);
                }
            }) as any,{});
        });

        it('should render fragment with forced version', async () => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            },
                            'test2': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test2')
                            },

                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);
            await bffGw.renderFragment({} as any, 'boutique-list', FRAGMENT_RENDER_MODES.PREVIEW, DEFAULT_MAIN_PARTIAL, createExpressMock({
                send: (gwResponse: string) => {
                    if (!gwResponse) throw new Error('No response from gateway');
                    expect(gwResponse).to.include(`<title>Browsing - boutique-list</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></head><body><div id="boutique-list">test2</div></body></html>`);
                }
            }) as any,{}, "test2");
        });

        it('should render fragment with given version via cookie', async () => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            },
                            'test2': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test2')
                            },

                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);
            await bffGw.renderFragment({} as any, 'boutique-list', FRAGMENT_RENDER_MODES.PREVIEW, DEFAULT_MAIN_PARTIAL, createExpressMock({
                send: (gwResponse: string) => {
                    if (!gwResponse) throw new Error('No response from gateway');
                    expect(gwResponse).to.include(`<title>Browsing - boutique-list</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></head><body><div id="boutique-list">test2</div></body></html>`);
                }
            }) as any,{'fragment_test': 'test2'});
        });

        it('should render fragment in preview mode with data passing', async () => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: {
                                    content(data: any) {
                                        return {
                                            main: `Requested:${data}`
                                        };
                                    },
                                    data(req: any) {
                                        return {
                                            data: `Url:${req.url}`
                                        };
                                    },
                                    placeholder() {
                                        return "Placeholder";
                                    }
                                } as any
                            }
                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);
            await bffGw.renderFragment({url: 'test'} as any, 'boutique-list', FRAGMENT_RENDER_MODES.PREVIEW, DEFAULT_MAIN_PARTIAL, createExpressMock({
                send: (gwResponse: string) => {
                    if (!gwResponse) throw new Error('No response from gateway');
                    expect(gwResponse).to.include(`<title>Browsing - boutique-list</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></head><body><div id="boutique-list">Requested:Url:test</div></body></html>`);
                }
            }) as any,{});
        });

        it('should throw error at render when fragment name not found', done => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [],
                                dependencies: [],
                                handler: require('./fragments/boutique-list/test')
                            }
                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);
            bffGw.renderFragment({} as any, 'not_exists', FRAGMENT_RENDER_MODES.STREAM, DEFAULT_MAIN_PARTIAL, {} as any, {}).then(data => done(data)).catch((e) => {
                expect(e.message).to.include('Failed to find fragment');
                done();
            });
        });

        it('should render fragment in preview mode with given assets with filename', async () => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [
                                    {
                                        fileName: 'test-asset-1-filename.js',
                                        link: 'test-asset-1-link.js',
                                        loadMethod: RESOURCE_LOADING_TYPE.ON_RENDER_START,
                                        type: RESOURCE_TYPE.JS,
                                        name: 'test-asset-1-name',
                                    },
                                    {
                                        fileName: 'test-asset-2-filename.css',
                                        link: 'test-asset-2-link.css',
                                        loadMethod: RESOURCE_LOADING_TYPE.ON_RENDER_START,
                                        type: RESOURCE_TYPE.CSS,
                                        name: 'test-asset-2-name',
                                    }
                                ],
                                dependencies: [],
                                handler: {
                                    content(data: any) {
                                        return {
                                            main: `Requested:${data}`
                                        };
                                    },
                                    data(req: any) {
                                        return {
                                            data: `Url:${req.url}`
                                        };
                                    },
                                    placeholder() {
                                        return "Placeholder";
                                    }
                                } as any
                            }
                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);
            await bffGw.renderFragment({url: 'test'} as any, 'boutique-list', FRAGMENT_RENDER_MODES.PREVIEW, DEFAULT_MAIN_PARTIAL, createExpressMock({
                send: (gwResponse: string) => {
                    if (!gwResponse) throw new Error('No response from gateway');
                    expect(gwResponse).to.include(`<script puzzle-dependency="puzzle-lib" type="text/javascript">puzzleLibScript</script><title>Browsing - boutique-list</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><link puzzle-asset="test-asset-2-name" rel="stylesheet" href="/boutique-list/static/test-asset-2-filename.css"></head><body><div id="boutique-list">Requested:Url:test</div><script puzzle-asset="test-asset-1-name" src="/boutique-list/static/test-asset-1-filename.js" type="text/javascript"></script>`);
                }
            }) as any,{});
        });

        it('should render fragment in preview mode with given assets without filename', async () => {
            const gatewayConfiguration: IGatewayBFFConfiguration = {
                ...commonGatewayConfiguration,
                fragments: [
                    {
                        name: 'boutique-list',
                        version: 'test',
                        render: {
                            url: '/'
                        },
                        testCookie: 'fragment_test',
                        versions: {
                            'test': {
                                assets: [
                                    {
                                        link: 'test-asset-1-link.js',
                                        loadMethod: RESOURCE_LOADING_TYPE.ON_RENDER_START,
                                        type: RESOURCE_TYPE.JS,
                                        name: 'test-asset-1-name',
                                    },
                                    {
                                        link: 'test-asset-2-link.css',
                                        loadMethod: RESOURCE_LOADING_TYPE.ON_RENDER_START,
                                        type: RESOURCE_TYPE.CSS,
                                        name: 'test-asset-2-name',
                                    }
                                ],
                                dependencies: [],
                                handler: {
                                    content(data: any) {
                                        return {
                                            main: `Requested:${data}`
                                        };
                                    },
                                    data(req: any) {
                                        return {
                                            data: `Url:${req.url}`
                                        };
                                    },
                                    placeholder() {
                                        return "Placeholder";
                                    }
                                } as any
                            }
                        }
                    }
                ]
            };

            const bffGw = new GatewayBFF(gatewayConfiguration);
            await bffGw.renderFragment({url: 'test'} as any, 'boutique-list', FRAGMENT_RENDER_MODES.PREVIEW, DEFAULT_MAIN_PARTIAL, createExpressMock({
                send: (gwResponse: string) => {
                    if (!gwResponse) throw new Error('No response from gateway');
                    expect(gwResponse).to.include(`<script puzzle-dependency="puzzle-lib" type="text/javascript">puzzleLibScript</script><title>Browsing - boutique-list</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><link puzzle-asset="test-asset-2-name" rel="stylesheet" href="test-asset-2-link.css"></head><body><div id="boutique-list">Requested:Url:test</div><script puzzle-asset="test-asset-1-name" src="test-asset-1-link.js" type="text/javascript"></script>`);
                }
            }) as any,{});
        });

    });

    describe('Storefront', () => {
        const commonGatewayStorefrontConfiguration = {
            name: 'Browsing',
            url: 'http://browsing-gw.com',
            config: {
                hash: '44',
                fragments: {
                    test: {
                        version: '1.0.0',
                        render: {
                            url: '/'
                        },
                        assets: [],
                        dependencies: [],
                        testCookie: 'test_1'
                    }
                }
            }
        };
        let interceptor: nock.Scope | null = null;

        beforeAll(() => {
            interceptor = createGateway(commonGatewayStorefrontConfiguration.name, commonGatewayStorefrontConfiguration.url, commonGatewayStorefrontConfiguration.config, true);
        });

        afterAll(() => {
            interceptor && interceptor.persist(false);
        });

        it('should create a new gateway storefront instance', () => {
            const gateway = new GatewayStorefrontInstance(commonGatewayStorefrontConfiguration);

            expect(gateway).to.be.instanceOf(GatewayStorefrontInstance);
        });

      it('should create a new gateway storefront instance with auth token', () => {
        const authToken = "Secret Token";
        const gateway = new GatewayStorefrontInstance(commonGatewayStorefrontConfiguration, authToken);

        expect(gateway).to.be.instanceOf(GatewayStorefrontInstance);
        expect(gateway.authToken).to.equals(authToken);
      });

        it('should load remote configuration successfully and fire ready event', done => {
            const gateway = new GatewayStorefrontInstance(commonGatewayStorefrontConfiguration);

            gateway.events.on(EVENTS.GATEWAY_READY, () => {
                done();
            });
        });

        it('should fire gateway ready updated event when hash changed', (done) => {
            const gateway = new GatewayStorefrontInstance(commonGatewayStorefrontConfiguration, faker.random.word(), 2);
            gateway.startUpdating();

            gateway.events.on(EVENTS.GATEWAY_READY, () => {
                if (gateway.config) {
                    gateway.config.hash = 'acg';
                } else {
                    done('config is not defined');
                }
            });

            gateway.events.on(EVENTS.GATEWAY_UPDATED, () => {
                if (gateway.config) {
                    gateway.stopUpdating();
                    done();
                } else {
                    done('config is not defined');
                }
            });
        }, DEFAULT_POLLING_INTERVAL * 5 + 2000);
    });
});
