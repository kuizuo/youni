'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">server documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-5b289603890af158e5b19defceaff62d4b725231ae7ed97e69e58245b866afe3ffd8541a19aa39c13620037dfbb62c5589e808708d36d4eaf72367e0d4fc013a"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-5b289603890af158e5b19defceaff62d4b725231ae7ed97e69e58245b866afe3ffd8541a19aa39c13620037dfbb62c5589e808708d36d4eaf72367e0d4fc013a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-5b289603890af158e5b19defceaff62d4b725231ae7ed97e69e58245b866afe3ffd8541a19aa39c13620037dfbb62c5589e808708d36d4eaf72367e0d4fc013a"' :
                                            'id="xs-controllers-links-module-AuthModule-5b289603890af158e5b19defceaff62d4b725231ae7ed97e69e58245b866afe3ffd8541a19aa39c13620037dfbb62c5589e808708d36d4eaf72367e0d4fc013a"' }>
                                            <li class="link">
                                                <a href="controllers/AccountController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccountController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/EmailController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/GoogleController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GoogleController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-5b289603890af158e5b19defceaff62d4b725231ae7ed97e69e58245b866afe3ffd8541a19aa39c13620037dfbb62c5589e808708d36d4eaf72367e0d4fc013a"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-5b289603890af158e5b19defceaff62d4b725231ae7ed97e69e58245b866afe3ffd8541a19aa39c13620037dfbb62c5589e808708d36d4eaf72367e0d4fc013a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-5b289603890af158e5b19defceaff62d4b725231ae7ed97e69e58245b866afe3ffd8541a19aa39c13620037dfbb62c5589e808708d36d4eaf72367e0d4fc013a"' :
                                        'id="xs-injectables-links-module-AuthModule-5b289603890af158e5b19defceaff62d4b725231ae7ed97e69e58245b866afe3ffd8541a19aa39c13620037dfbb62c5589e808708d36d4eaf72367e0d4fc013a"' }>
                                        <li class="link">
                                            <a href="injectables/GoogleStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GoogleStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LocalStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocalStrategy</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/BullModule.html" data-type="entity-link" >BullModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/CacheModule.html" data-type="entity-link" >CacheModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CacheModule-ca5cce954d5169fe5c8441cf197c94a155f3ae8ff5cfe6a847868b7d55c46dd3a622faad61f1151e4666132fe216d4e4b9e1057858e7049b055296d16c074f96"' : 'data-bs-target="#xs-injectables-links-module-CacheModule-ca5cce954d5169fe5c8441cf197c94a155f3ae8ff5cfe6a847868b7d55c46dd3a622faad61f1151e4666132fe216d4e4b9e1057858e7049b055296d16c074f96"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CacheModule-ca5cce954d5169fe5c8441cf197c94a155f3ae8ff5cfe6a847868b7d55c46dd3a622faad61f1151e4666132fe216d4e4b9e1057858e7049b055296d16c074f96"' :
                                        'id="xs-injectables-links-module-CacheModule-ca5cce954d5169fe5c8441cf197c94a155f3ae8ff5cfe6a847868b7d55c46dd3a622faad61f1151e4666132fe216d4e4b9e1057858e7049b055296d16c074f96"' }>
                                        <li class="link">
                                            <a href="injectables/CacheService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CacheService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CaptchaModule.html" data-type="entity-link" >CaptchaModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CaptchaModule-dadd6533002cb78973de009e763e9996ffbfc6f3a68a5b270fcd61b5836da0da4eb023fdba37888a856b23a573606fca8a7c6a6399b0cbf1173d2bc8fb0cc6e4"' : 'data-bs-target="#xs-controllers-links-module-CaptchaModule-dadd6533002cb78973de009e763e9996ffbfc6f3a68a5b270fcd61b5836da0da4eb023fdba37888a856b23a573606fca8a7c6a6399b0cbf1173d2bc8fb0cc6e4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CaptchaModule-dadd6533002cb78973de009e763e9996ffbfc6f3a68a5b270fcd61b5836da0da4eb023fdba37888a856b23a573606fca8a7c6a6399b0cbf1173d2bc8fb0cc6e4"' :
                                            'id="xs-controllers-links-module-CaptchaModule-dadd6533002cb78973de009e763e9996ffbfc6f3a68a5b270fcd61b5836da0da4eb023fdba37888a856b23a573606fca8a7c6a6399b0cbf1173d2bc8fb0cc6e4"' }>
                                            <li class="link">
                                                <a href="controllers/CaptchaController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CaptchaController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/CaslModule.html" data-type="entity-link" >CaslModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CaslModule-dc6e6b8a8c75e4b26bfbb870f37f30f85f6aeab12f8c1649e7b0912b1eb0e3d53e167c0806af95a35b8f497fdd2f9bdeb897f0df80582a5924a20a84a0b97faf"' : 'data-bs-target="#xs-injectables-links-module-CaslModule-dc6e6b8a8c75e4b26bfbb870f37f30f85f6aeab12f8c1649e7b0912b1eb0e3d53e167c0806af95a35b8f497fdd2f9bdeb897f0df80582a5924a20a84a0b97faf"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CaslModule-dc6e6b8a8c75e4b26bfbb870f37f30f85f6aeab12f8c1649e7b0912b1eb0e3d53e167c0806af95a35b8f497fdd2f9bdeb897f0df80582a5924a20a84a0b97faf"' :
                                        'id="xs-injectables-links-module-CaslModule-dc6e6b8a8c75e4b26bfbb870f37f30f85f6aeab12f8c1649e7b0912b1eb0e3d53e167c0806af95a35b8f497fdd2f9bdeb897f0df80582a5924a20a84a0b97faf"' }>
                                        <li class="link">
                                            <a href="injectables/AbilityService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AbilityService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CollectionModule.html" data-type="entity-link" >CollectionModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CollectionModule-bc6ea28ec25f982c4f4c79342531291557c466833b00c3b5b9d56496f7c44a0bd0080d3c2d91f8d5d1d3d03dd5c0669cd13577bf9eaab51632f7e04b64d25c0f"' : 'data-bs-target="#xs-controllers-links-module-CollectionModule-bc6ea28ec25f982c4f4c79342531291557c466833b00c3b5b9d56496f7c44a0bd0080d3c2d91f8d5d1d3d03dd5c0669cd13577bf9eaab51632f7e04b64d25c0f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CollectionModule-bc6ea28ec25f982c4f4c79342531291557c466833b00c3b5b9d56496f7c44a0bd0080d3c2d91f8d5d1d3d03dd5c0669cd13577bf9eaab51632f7e04b64d25c0f"' :
                                            'id="xs-controllers-links-module-CollectionModule-bc6ea28ec25f982c4f4c79342531291557c466833b00c3b5b9d56496f7c44a0bd0080d3c2d91f8d5d1d3d03dd5c0669cd13577bf9eaab51632f7e04b64d25c0f"' }>
                                            <li class="link">
                                                <a href="controllers/CollectionController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CollectionController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CollectionModule-bc6ea28ec25f982c4f4c79342531291557c466833b00c3b5b9d56496f7c44a0bd0080d3c2d91f8d5d1d3d03dd5c0669cd13577bf9eaab51632f7e04b64d25c0f"' : 'data-bs-target="#xs-injectables-links-module-CollectionModule-bc6ea28ec25f982c4f4c79342531291557c466833b00c3b5b9d56496f7c44a0bd0080d3c2d91f8d5d1d3d03dd5c0669cd13577bf9eaab51632f7e04b64d25c0f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CollectionModule-bc6ea28ec25f982c4f4c79342531291557c466833b00c3b5b9d56496f7c44a0bd0080d3c2d91f8d5d1d3d03dd5c0669cd13577bf9eaab51632f7e04b64d25c0f"' :
                                        'id="xs-injectables-links-module-CollectionModule-bc6ea28ec25f982c4f4c79342531291557c466833b00c3b5b9d56496f7c44a0bd0080d3c2d91f8d5d1d3d03dd5c0669cd13577bf9eaab51632f7e04b64d25c0f"' }>
                                        <li class="link">
                                            <a href="injectables/CollectionAbility.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CollectionAbility</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CollectionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CollectionService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CollectionTrpcRouter.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CollectionTrpcRouter</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CommentModule.html" data-type="entity-link" >CommentModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CommentModule-9585f3b8be59ca8847f390e3267943413b2edbd05493fbed5847601f0deaa8749e1bbf40d54d4105138aacfa28bc29d94caca40460f84268ba3d5213781585b4"' : 'data-bs-target="#xs-controllers-links-module-CommentModule-9585f3b8be59ca8847f390e3267943413b2edbd05493fbed5847601f0deaa8749e1bbf40d54d4105138aacfa28bc29d94caca40460f84268ba3d5213781585b4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CommentModule-9585f3b8be59ca8847f390e3267943413b2edbd05493fbed5847601f0deaa8749e1bbf40d54d4105138aacfa28bc29d94caca40460f84268ba3d5213781585b4"' :
                                            'id="xs-controllers-links-module-CommentModule-9585f3b8be59ca8847f390e3267943413b2edbd05493fbed5847601f0deaa8749e1bbf40d54d4105138aacfa28bc29d94caca40460f84268ba3d5213781585b4"' }>
                                            <li class="link">
                                                <a href="controllers/CommentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommentController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CommentModule-9585f3b8be59ca8847f390e3267943413b2edbd05493fbed5847601f0deaa8749e1bbf40d54d4105138aacfa28bc29d94caca40460f84268ba3d5213781585b4"' : 'data-bs-target="#xs-injectables-links-module-CommentModule-9585f3b8be59ca8847f390e3267943413b2edbd05493fbed5847601f0deaa8749e1bbf40d54d4105138aacfa28bc29d94caca40460f84268ba3d5213781585b4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CommentModule-9585f3b8be59ca8847f390e3267943413b2edbd05493fbed5847601f0deaa8749e1bbf40d54d4105138aacfa28bc29d94caca40460f84268ba3d5213781585b4"' :
                                        'id="xs-injectables-links-module-CommentModule-9585f3b8be59ca8847f390e3267943413b2edbd05493fbed5847601f0deaa8749e1bbf40d54d4105138aacfa28bc29d94caca40460f84268ba3d5213781585b4"' }>
                                        <li class="link">
                                            <a href="injectables/CommentAbility.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommentAbility</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CommentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommentService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CommentTrpcRouter.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommentTrpcRouter</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/FileModule.html" data-type="entity-link" >FileModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-FileModule-01785266ff034995ff272cbbee4a8970357787d6cf74c2437ab24c52fb67945884c41130593f8ff7ccc1a4d78778f211b9505c7a331225b3b107109267709980"' : 'data-bs-target="#xs-controllers-links-module-FileModule-01785266ff034995ff272cbbee4a8970357787d6cf74c2437ab24c52fb67945884c41130593f8ff7ccc1a4d78778f211b9505c7a331225b3b107109267709980"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-FileModule-01785266ff034995ff272cbbee4a8970357787d6cf74c2437ab24c52fb67945884c41130593f8ff7ccc1a4d78778f211b9505c7a331225b3b107109267709980"' :
                                            'id="xs-controllers-links-module-FileModule-01785266ff034995ff272cbbee4a8970357787d6cf74c2437ab24c52fb67945884c41130593f8ff7ccc1a4d78778f211b9505c7a331225b3b107109267709980"' }>
                                            <li class="link">
                                                <a href="controllers/FileController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-FileModule-01785266ff034995ff272cbbee4a8970357787d6cf74c2437ab24c52fb67945884c41130593f8ff7ccc1a4d78778f211b9505c7a331225b3b107109267709980"' : 'data-bs-target="#xs-injectables-links-module-FileModule-01785266ff034995ff272cbbee4a8970357787d6cf74c2437ab24c52fb67945884c41130593f8ff7ccc1a4d78778f211b9505c7a331225b3b107109267709980"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FileModule-01785266ff034995ff272cbbee4a8970357787d6cf74c2437ab24c52fb67945884c41130593f8ff7ccc1a4d78778f211b9505c7a331225b3b107109267709980"' :
                                        'id="xs-injectables-links-module-FileModule-01785266ff034995ff272cbbee4a8970357787d6cf74c2437ab24c52fb67945884c41130593f8ff7ccc1a4d78778f211b9505c7a331225b3b107109267709980"' }>
                                        <li class="link">
                                            <a href="injectables/FileService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/HealthModule.html" data-type="entity-link" >HealthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-HealthModule-214838786901b4bea4d85d5fe1617a2467ece7349074cd6e3575274c11082f0d71278d825c204e768b9e576328cbad2ce61614bdb3b502d09728801c2cccf75d"' : 'data-bs-target="#xs-controllers-links-module-HealthModule-214838786901b4bea4d85d5fe1617a2467ece7349074cd6e3575274c11082f0d71278d825c204e768b9e576328cbad2ce61614bdb3b502d09728801c2cccf75d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-HealthModule-214838786901b4bea4d85d5fe1617a2467ece7349074cd6e3575274c11082f0d71278d825c204e768b9e576328cbad2ce61614bdb3b502d09728801c2cccf75d"' :
                                            'id="xs-controllers-links-module-HealthModule-214838786901b4bea4d85d5fe1617a2467ece7349074cd6e3575274c11082f0d71278d825c204e768b9e576328cbad2ce61614bdb3b502d09728801c2cccf75d"' }>
                                            <li class="link">
                                                <a href="controllers/HealthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HealthController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HelperModule.html" data-type="entity-link" >HelperModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-HelperModule-9dd5438af966d5533de990eabcb40a1dcb3bc13299fbf95b566a4c626886a5de923abcf2dd9eee7c96c8a6371bdacac3ae6f2afbaa138ec8027ee1cf93c316b2"' : 'data-bs-target="#xs-injectables-links-module-HelperModule-9dd5438af966d5533de990eabcb40a1dcb3bc13299fbf95b566a4c626886a5de923abcf2dd9eee7c96c8a6371bdacac3ae6f2afbaa138ec8027ee1cf93c316b2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-HelperModule-9dd5438af966d5533de990eabcb40a1dcb3bc13299fbf95b566a4c626886a5de923abcf2dd9eee7c96c8a6371bdacac3ae6f2afbaa138ec8027ee1cf93c316b2"' :
                                        'id="xs-injectables-links-module-HelperModule-9dd5438af966d5533de990eabcb40a1dcb3bc13299fbf95b566a4c626886a5de923abcf2dd9eee7c96c8a6371bdacac3ae6f2afbaa138ec8027ee1cf93c316b2"' }>
                                        <li class="link">
                                            <a href="injectables/CronService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CronService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/HistoryModule.html" data-type="entity-link" >HistoryModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-HistoryModule-666e59542c19beb94607f2615a6ebf46c7754b436b7346f0a01080919051ab30102ffa673037b64648c77eba98bd00f0b21bb268b6fe7423421053184dde2942"' : 'data-bs-target="#xs-controllers-links-module-HistoryModule-666e59542c19beb94607f2615a6ebf46c7754b436b7346f0a01080919051ab30102ffa673037b64648c77eba98bd00f0b21bb268b6fe7423421053184dde2942"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-HistoryModule-666e59542c19beb94607f2615a6ebf46c7754b436b7346f0a01080919051ab30102ffa673037b64648c77eba98bd00f0b21bb268b6fe7423421053184dde2942"' :
                                            'id="xs-controllers-links-module-HistoryModule-666e59542c19beb94607f2615a6ebf46c7754b436b7346f0a01080919051ab30102ffa673037b64648c77eba98bd00f0b21bb268b6fe7423421053184dde2942"' }>
                                            <li class="link">
                                                <a href="controllers/HistoryController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HistoryController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-HistoryModule-666e59542c19beb94607f2615a6ebf46c7754b436b7346f0a01080919051ab30102ffa673037b64648c77eba98bd00f0b21bb268b6fe7423421053184dde2942"' : 'data-bs-target="#xs-injectables-links-module-HistoryModule-666e59542c19beb94607f2615a6ebf46c7754b436b7346f0a01080919051ab30102ffa673037b64648c77eba98bd00f0b21bb268b6fe7423421053184dde2942"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-HistoryModule-666e59542c19beb94607f2615a6ebf46c7754b436b7346f0a01080919051ab30102ffa673037b64648c77eba98bd00f0b21bb268b6fe7423421053184dde2942"' :
                                        'id="xs-injectables-links-module-HistoryModule-666e59542c19beb94607f2615a6ebf46c7754b436b7346f0a01080919051ab30102ffa673037b64648c77eba98bd00f0b21bb268b6fe7423421053184dde2942"' }>
                                        <li class="link">
                                            <a href="injectables/HistoryService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HistoryService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/HistoryTrpcRouter.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HistoryTrpcRouter</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/InteractModule.html" data-type="entity-link" >InteractModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-InteractModule-cd656d3211919043660151cc584fcca5385ddc6410165eda4fb524b3697a018a3fe643ecc82c62965d7c664a9d4dd5417a38f6fb61f848120badd7bfa9af8848"' : 'data-bs-target="#xs-injectables-links-module-InteractModule-cd656d3211919043660151cc584fcca5385ddc6410165eda4fb524b3697a018a3fe643ecc82c62965d7c664a9d4dd5417a38f6fb61f848120badd7bfa9af8848"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-InteractModule-cd656d3211919043660151cc584fcca5385ddc6410165eda4fb524b3697a018a3fe643ecc82c62965d7c664a9d4dd5417a38f6fb61f848120badd7bfa9af8848"' :
                                        'id="xs-injectables-links-module-InteractModule-cd656d3211919043660151cc584fcca5385ddc6410165eda4fb524b3697a018a3fe643ecc82c62965d7c664a9d4dd5417a38f6fb61f848120badd7bfa9af8848"' }>
                                        <li class="link">
                                            <a href="injectables/CountingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CountingService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/FollowService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FollowService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/InteractListener.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InteractListener</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/InteractTrpcRouter.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InteractTrpcRouter</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LikeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LikeService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ViewService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ViewService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LoggerModule.html" data-type="entity-link" >LoggerModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-LoggerModule-d07ccf959cc0e47d66b7315acc6351b1fbba6fdff335098de6cffbdf1a2d0e64f248dd16239a2fbc812981be4586682ff6a27d337ba09f5dc9a0a52996b75e78"' : 'data-bs-target="#xs-injectables-links-module-LoggerModule-d07ccf959cc0e47d66b7315acc6351b1fbba6fdff335098de6cffbdf1a2d0e64f248dd16239a2fbc812981be4586682ff6a27d337ba09f5dc9a0a52996b75e78"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-LoggerModule-d07ccf959cc0e47d66b7315acc6351b1fbba6fdff335098de6cffbdf1a2d0e64f248dd16239a2fbc812981be4586682ff6a27d337ba09f5dc9a0a52996b75e78"' :
                                        'id="xs-injectables-links-module-LoggerModule-d07ccf959cc0e47d66b7315acc6351b1fbba6fdff335098de6cffbdf1a2d0e64f248dd16239a2fbc812981be4586682ff6a27d337ba09f5dc9a0a52996b75e78"' }>
                                        <li class="link">
                                            <a href="injectables/MyLogger.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MyLogger</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MailerModule.html" data-type="entity-link" >MailerModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MailerModule-997f1ca692992187f488f8e326ae7f142f483dba90526ee1d47707d01bf899a8b6922d2150bc7c06990a5b723dc3b0c5558404386d0b151d125df9cd12c73ec1"' : 'data-bs-target="#xs-injectables-links-module-MailerModule-997f1ca692992187f488f8e326ae7f142f483dba90526ee1d47707d01bf899a8b6922d2150bc7c06990a5b723dc3b0c5558404386d0b151d125df9cd12c73ec1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MailerModule-997f1ca692992187f488f8e326ae7f142f483dba90526ee1d47707d01bf899a8b6922d2150bc7c06990a5b723dc3b0c5558404386d0b151d125df9cd12c73ec1"' :
                                        'id="xs-injectables-links-module-MailerModule-997f1ca692992187f488f8e326ae7f142f483dba90526ee1d47707d01bf899a8b6922d2150bc7c06990a5b723dc3b0c5558404386d0b151d125df9cd12c73ec1"' }>
                                        <li class="link">
                                            <a href="injectables/MailerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MailerService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NoteModule.html" data-type="entity-link" >NoteModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-NoteModule-d9949ec9f6227e70eabb7e14c198422fe279193de4701c2862ee60d169f772b655d6955810d86a0d7bb46a92538c3242fae46333c3d12563f6c9dcd477ed9589"' : 'data-bs-target="#xs-controllers-links-module-NoteModule-d9949ec9f6227e70eabb7e14c198422fe279193de4701c2862ee60d169f772b655d6955810d86a0d7bb46a92538c3242fae46333c3d12563f6c9dcd477ed9589"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-NoteModule-d9949ec9f6227e70eabb7e14c198422fe279193de4701c2862ee60d169f772b655d6955810d86a0d7bb46a92538c3242fae46333c3d12563f6c9dcd477ed9589"' :
                                            'id="xs-controllers-links-module-NoteModule-d9949ec9f6227e70eabb7e14c198422fe279193de4701c2862ee60d169f772b655d6955810d86a0d7bb46a92538c3242fae46333c3d12563f6c9dcd477ed9589"' }>
                                            <li class="link">
                                                <a href="controllers/NoteController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NoteController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-NoteModule-d9949ec9f6227e70eabb7e14c198422fe279193de4701c2862ee60d169f772b655d6955810d86a0d7bb46a92538c3242fae46333c3d12563f6c9dcd477ed9589"' : 'data-bs-target="#xs-injectables-links-module-NoteModule-d9949ec9f6227e70eabb7e14c198422fe279193de4701c2862ee60d169f772b655d6955810d86a0d7bb46a92538c3242fae46333c3d12563f6c9dcd477ed9589"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NoteModule-d9949ec9f6227e70eabb7e14c198422fe279193de4701c2862ee60d169f772b655d6955810d86a0d7bb46a92538c3242fae46333c3d12563f6c9dcd477ed9589"' :
                                        'id="xs-injectables-links-module-NoteModule-d9949ec9f6227e70eabb7e14c198422fe279193de4701c2862ee60d169f772b655d6955810d86a0d7bb46a92538c3242fae46333c3d12563f6c9dcd477ed9589"' }>
                                        <li class="link">
                                            <a href="injectables/NoteAbility.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NoteAbility</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NoteListener.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NoteListener</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NotePublicService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotePublicService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NoteService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NoteService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NoteTrpcRouter.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NoteTrpcRouter</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NoteTagModule.html" data-type="entity-link" >NoteTagModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationModule.html" data-type="entity-link" >NotificationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-NotificationModule-788e95e9e408f28b4cdcf192e110982084c46fca90229afdc2259b99b51602ae0e7d77f0e7d4c0c0c10c942cd9d5a2bf1378b77c14391482e5b37e3e499ea4c7"' : 'data-bs-target="#xs-controllers-links-module-NotificationModule-788e95e9e408f28b4cdcf192e110982084c46fca90229afdc2259b99b51602ae0e7d77f0e7d4c0c0c10c942cd9d5a2bf1378b77c14391482e5b37e3e499ea4c7"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-NotificationModule-788e95e9e408f28b4cdcf192e110982084c46fca90229afdc2259b99b51602ae0e7d77f0e7d4c0c0c10c942cd9d5a2bf1378b77c14391482e5b37e3e499ea4c7"' :
                                            'id="xs-controllers-links-module-NotificationModule-788e95e9e408f28b4cdcf192e110982084c46fca90229afdc2259b99b51602ae0e7d77f0e7d4c0c0c10c942cd9d5a2bf1378b77c14391482e5b37e3e499ea4c7"' }>
                                            <li class="link">
                                                <a href="controllers/NotificationController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-NotificationModule-788e95e9e408f28b4cdcf192e110982084c46fca90229afdc2259b99b51602ae0e7d77f0e7d4c0c0c10c942cd9d5a2bf1378b77c14391482e5b37e3e499ea4c7"' : 'data-bs-target="#xs-injectables-links-module-NotificationModule-788e95e9e408f28b4cdcf192e110982084c46fca90229afdc2259b99b51602ae0e7d77f0e7d4c0c0c10c942cd9d5a2bf1378b77c14391482e5b37e3e499ea4c7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-NotificationModule-788e95e9e408f28b4cdcf192e110982084c46fca90229afdc2259b99b51602ae0e7d77f0e7d4c0c0c10c942cd9d5a2bf1378b77c14391482e5b37e3e499ea4c7"' :
                                        'id="xs-injectables-links-module-NotificationModule-788e95e9e408f28b4cdcf192e110982084c46fca90229afdc2259b99b51602ae0e7d77f0e7d4c0c0c10c942cd9d5a2bf1378b77c14391482e5b37e3e499ea4c7"' }>
                                        <li class="link">
                                            <a href="injectables/NotifactionTrpcRouter.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotifactionTrpcRouter</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NotificationListener.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationListener</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NotificationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RedisModule.html" data-type="entity-link" >RedisModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RedisModule-eac91550cb3e6355415d03f9b04132f2901d787909bb6b1663007467949df0d06692cd4a7ee9d0938b9d1f3381217e6fd94012ba82adc6b043ad63e1101626bc"' : 'data-bs-target="#xs-injectables-links-module-RedisModule-eac91550cb3e6355415d03f9b04132f2901d787909bb6b1663007467949df0d06692cd4a7ee9d0938b9d1f3381217e6fd94012ba82adc6b043ad63e1101626bc"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RedisModule-eac91550cb3e6355415d03f9b04132f2901d787909bb6b1663007467949df0d06692cd4a7ee9d0938b9d1f3381217e6fd94012ba82adc6b043ad63e1101626bc"' :
                                        'id="xs-injectables-links-module-RedisModule-eac91550cb3e6355415d03f9b04132f2901d787909bb6b1663007467949df0d06692cd4a7ee9d0938b9d1f3381217e6fd94012ba82adc6b043ad63e1101626bc"' }>
                                        <li class="link">
                                            <a href="injectables/RedisPubSubService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RedisPubSubService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SocketModule.html" data-type="entity-link" >SocketModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/TodoModule.html" data-type="entity-link" >TodoModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-TodoModule-74cf2a61ebb5ff359734e9d243e7266d80f1dd869ab669fb5ee498724bda7b8c034f762c318258ee32cbce1f69d9f56b6c8f756714d28cc9c7e2a0bb19172bd3"' : 'data-bs-target="#xs-controllers-links-module-TodoModule-74cf2a61ebb5ff359734e9d243e7266d80f1dd869ab669fb5ee498724bda7b8c034f762c318258ee32cbce1f69d9f56b6c8f756714d28cc9c7e2a0bb19172bd3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-TodoModule-74cf2a61ebb5ff359734e9d243e7266d80f1dd869ab669fb5ee498724bda7b8c034f762c318258ee32cbce1f69d9f56b6c8f756714d28cc9c7e2a0bb19172bd3"' :
                                            'id="xs-controllers-links-module-TodoModule-74cf2a61ebb5ff359734e9d243e7266d80f1dd869ab669fb5ee498724bda7b8c034f762c318258ee32cbce1f69d9f56b6c8f756714d28cc9c7e2a0bb19172bd3"' }>
                                            <li class="link">
                                                <a href="controllers/TodoController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TodoController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TodoModule-74cf2a61ebb5ff359734e9d243e7266d80f1dd869ab669fb5ee498724bda7b8c034f762c318258ee32cbce1f69d9f56b6c8f756714d28cc9c7e2a0bb19172bd3"' : 'data-bs-target="#xs-injectables-links-module-TodoModule-74cf2a61ebb5ff359734e9d243e7266d80f1dd869ab669fb5ee498724bda7b8c034f762c318258ee32cbce1f69d9f56b6c8f756714d28cc9c7e2a0bb19172bd3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TodoModule-74cf2a61ebb5ff359734e9d243e7266d80f1dd869ab669fb5ee498724bda7b8c034f762c318258ee32cbce1f69d9f56b6c8f756714d28cc9c7e2a0bb19172bd3"' :
                                        'id="xs-injectables-links-module-TodoModule-74cf2a61ebb5ff359734e9d243e7266d80f1dd869ab669fb5ee498724bda7b8c034f762c318258ee32cbce1f69d9f56b6c8f756714d28cc9c7e2a0bb19172bd3"' }>
                                        <li class="link">
                                            <a href="injectables/TodoAbility.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TodoAbility</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TodoService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TodoService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TodoTrpcRouter.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TodoTrpcRouter</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TRPCModule.html" data-type="entity-link" >TRPCModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TRPCModule-09e21c3876666f764588931b016e540b88f50e319b4f3a2459d9fceae2cd20901ee14ca28d77d59d2ddbc1f0ec97522d79819c75e590aac0f2beb88d9f64e053"' : 'data-bs-target="#xs-injectables-links-module-TRPCModule-09e21c3876666f764588931b016e540b88f50e319b4f3a2459d9fceae2cd20901ee14ca28d77d59d2ddbc1f0ec97522d79819c75e590aac0f2beb88d9f64e053"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TRPCModule-09e21c3876666f764588931b016e540b88f50e319b4f3a2459d9fceae2cd20901ee14ca28d77d59d2ddbc1f0ec97522d79819c75e590aac0f2beb88d9f64e053"' :
                                        'id="xs-injectables-links-module-TRPCModule-09e21c3876666f764588931b016e540b88f50e319b4f3a2459d9fceae2cd20901ee14ca28d77d59d2ddbc1f0ec97522d79819c75e590aac0f2beb88d9f64e053"' }>
                                        <li class="link">
                                            <a href="injectables/TRPCService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TRPCService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UserModule-db256486683f307ff545fe332ec43e5e6679490f635190daf90eae1476ac9ad3544bb3152ad260b93335a4bd954842ad2ab9e7a01b982f64ac843404f2034ba7"' : 'data-bs-target="#xs-controllers-links-module-UserModule-db256486683f307ff545fe332ec43e5e6679490f635190daf90eae1476ac9ad3544bb3152ad260b93335a4bd954842ad2ab9e7a01b982f64ac843404f2034ba7"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UserModule-db256486683f307ff545fe332ec43e5e6679490f635190daf90eae1476ac9ad3544bb3152ad260b93335a4bd954842ad2ab9e7a01b982f64ac843404f2034ba7"' :
                                            'id="xs-controllers-links-module-UserModule-db256486683f307ff545fe332ec43e5e6679490f635190daf90eae1476ac9ad3544bb3152ad260b93335a4bd954842ad2ab9e7a01b982f64ac843404f2034ba7"' }>
                                            <li class="link">
                                                <a href="controllers/UserController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UserModule-db256486683f307ff545fe332ec43e5e6679490f635190daf90eae1476ac9ad3544bb3152ad260b93335a4bd954842ad2ab9e7a01b982f64ac843404f2034ba7"' : 'data-bs-target="#xs-injectables-links-module-UserModule-db256486683f307ff545fe332ec43e5e6679490f635190daf90eae1476ac9ad3544bb3152ad260b93335a4bd954842ad2ab9e7a01b982f64ac843404f2034ba7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-db256486683f307ff545fe332ec43e5e6679490f635190daf90eae1476ac9ad3544bb3152ad260b93335a4bd954842ad2ab9e7a01b982f64ac843404f2034ba7"' :
                                        'id="xs-injectables-links-module-UserModule-db256486683f307ff545fe332ec43e5e6679490f635190daf90eae1476ac9ad3544bb3152ad260b93335a4bd954842ad2ab9e7a01b982f64ac843404f2034ba7"' }>
                                        <li class="link">
                                            <a href="injectables/UserAbility.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserAbility</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserPublicService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserPublicService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserTrpcRouter.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserTrpcRouter</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AccountController.html" data-type="entity-link" >AccountController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/EmailController.html" data-type="entity-link" >EmailController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/GoogleController.html" data-type="entity-link" >GoogleController</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AdminEventsGateway.html" data-type="entity-link" >AdminEventsGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/AllExceptionsFilter.html" data-type="entity-link" >AllExceptionsFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/AllExceptionsFilter-1.html" data-type="entity-link" >AllExceptionsFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseAbility.html" data-type="entity-link" >BaseAbility</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseGateway.html" data-type="entity-link" >BaseGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/BatchDeleteDto.html" data-type="entity-link" >BatchDeleteDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/BizException.html" data-type="entity-link" >BizException</a>
                            </li>
                            <li class="link">
                                <a href="classes/BroadcastBaseGateway.html" data-type="entity-link" >BroadcastBaseGateway</a>
                            </li>
                            <li class="link">
                                <a href="classes/CannotFindException.html" data-type="entity-link" >CannotFindException</a>
                            </li>
                            <li class="link">
                                <a href="classes/CheckCodeDto.html" data-type="entity-link" >CheckCodeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CollectionDto.html" data-type="entity-link" >CollectionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CollectionItemDto.html" data-type="entity-link" >CollectionItemDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CollectionItemQueryDto.html" data-type="entity-link" >CollectionItemQueryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CollectionPagerDto.html" data-type="entity-link" >CollectionPagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CollectionUpdateDto.html" data-type="entity-link" >CollectionUpdateDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CommentCreateEvent.html" data-type="entity-link" >CommentCreateEvent</a>
                            </li>
                            <li class="link">
                                <a href="classes/CommentLikeEvent.html" data-type="entity-link" >CommentLikeEvent</a>
                            </li>
                            <li class="link">
                                <a href="classes/CommentPagerDto.html" data-type="entity-link" >CommentPagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCommentDto.html" data-type="entity-link" >CreateCommentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateNotificationDto.html" data-type="entity-link" >CreateNotificationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileQueryDto.html" data-type="entity-link" >FileQueryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileUploadDto.html" data-type="entity-link" >FileUploadDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/HistoryPagerDto.html" data-type="entity-link" >HistoryPagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/IdDto.html" data-type="entity-link" >IdDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImageCaptcha.html" data-type="entity-link" >ImageCaptcha</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImageCaptchaDto.html" data-type="entity-link" >ImageCaptchaDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImagesDto.html" data-type="entity-link" >ImagesDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/InteractPagerDto.html" data-type="entity-link" >InteractPagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/InteractProcessor.html" data-type="entity-link" >InteractProcessor</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginDto.html" data-type="entity-link" >LoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginResult.html" data-type="entity-link" >LoginResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginResult-1.html" data-type="entity-link" >LoginResult</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoteCollectEvent.html" data-type="entity-link" >NoteCollectEvent</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoteDto.html" data-type="entity-link" >NoteDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoteLikeEvent.html" data-type="entity-link" >NoteLikeEvent</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotePagerDto.html" data-type="entity-link" >NotePagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoteSearchDto.html" data-type="entity-link" >NoteSearchDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoteTagDto.html" data-type="entity-link" >NoteTagDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoteTagPagerDto.html" data-type="entity-link" >NoteTagPagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoteTagUpdateDto.html" data-type="entity-link" >NoteTagUpdateDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoteUpdateDto.html" data-type="entity-link" >NoteUpdateDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotificationPagerDto.html" data-type="entity-link" >NotificationPagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PagerDto.html" data-type="entity-link" >PagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PasswordUpdateDto.html" data-type="entity-link" >PasswordUpdateDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PrismaClientExceptionFilter.html" data-type="entity-link" >PrismaClientExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/RedisIoAdapter.html" data-type="entity-link" >RedisIoAdapter</a>
                            </li>
                            <li class="link">
                                <a href="classes/RedisSubPub.html" data-type="entity-link" >RedisSubPub</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegisterDto.html" data-type="entity-link" >RegisterDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResetPasswordDto.html" data-type="entity-link" >ResetPasswordDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResOp.html" data-type="entity-link" >ResOp</a>
                            </li>
                            <li class="link">
                                <a href="classes/SendEmailCodeDto.html" data-type="entity-link" >SendEmailCodeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SendSmsCodeDto.html" data-type="entity-link" >SendSmsCodeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Snowflake.html" data-type="entity-link" >Snowflake</a>
                            </li>
                            <li class="link">
                                <a href="classes/SubCommentPagerDto.html" data-type="entity-link" >SubCommentPagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TodoDto.html" data-type="entity-link" >TodoDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TodoPagerDto.html" data-type="entity-link" >TodoPagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TodoUpdateDto.html" data-type="entity-link" >TodoUpdateDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateProfileDto.html" data-type="entity-link" >UpdateProfileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserDto.html" data-type="entity-link" >UserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserFollowEvent.html" data-type="entity-link" >UserFollowEvent</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserNotePagerDto.html" data-type="entity-link" >UserNotePagerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserPasswordDto.html" data-type="entity-link" >UserPasswordDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserQueryDto.html" data-type="entity-link" >UserQueryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserUpdateDto.html" data-type="entity-link" >UserUpdateDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/WebEventsGateway.html" data-type="entity-link" >WebEventsGateway</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CaptchaService.html" data-type="entity-link" >CaptchaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GoogleStrategy.html" data-type="entity-link" >GoogleStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IdempotenceInterceptor.html" data-type="entity-link" >IdempotenceInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtStrategy.html" data-type="entity-link" >JwtStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalGuard.html" data-type="entity-link" >LocalGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalStrategy.html" data-type="entity-link" >LocalStrategy</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoggingInterceptor.html" data-type="entity-link" >LoggingInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NoteTagService.html" data-type="entity-link" >NoteTagService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NoteTagTrpcRouter.html" data-type="entity-link" >NoteTagTrpcRouter</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ParseIntPipe.html" data-type="entity-link" >ParseIntPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TimeoutInterceptor.html" data-type="entity-link" >TimeoutInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TokenService.html" data-type="entity-link" >TokenService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransformInterceptor.html" data-type="entity-link" >TransformInterceptor</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/PolicyGuard.html" data-type="entity-link" >PolicyGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AuthGatewayOptions.html" data-type="entity-link" >AuthGatewayOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErrorCodesStatusMapping.html" data-type="entity-link" >ErrorCodesStatusMapping</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GoogleProfile.html" data-type="entity-link" >GoogleProfile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuthGateway.html" data-type="entity-link" >IAuthGateway</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBaseResponse.html" data-type="entity-link" >IBaseResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IdempotenceOption.html" data-type="entity-link" >IdempotenceOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/JobData.html" data-type="entity-link" >JobData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/myError.html" data-type="entity-link" >myError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TA.html" data-type="entity-link" >TA</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});