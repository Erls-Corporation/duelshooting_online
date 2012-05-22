var DuelShooting = Class.create({

    sync: null,
    opening: null,
    condition: null,
    sounds: null,
    timeKeeper: null,
    ship: null,
    enemy: null,
    weapons: null,
    action: null,
    cmd: null,
    game: null,

    initialize: function() {
        this.opening = new Opening(new Title());
        this.condition = new Condition();
        this.opening.show();
        this.condition.renderElement();
        this.condition.update('Scouting for the enemy...', '#99FF99');
        this.sync = new Synchronizer('/', this.callback.bind(this), this.finish.bind(this));
    },

    callback: function(data) {
        this.setupSoundEffect();
        this.setupShip();
        this.setupTimeKeeper();
        this.setupGame();
        this.renderElements();
        this.game.start();
        this.timeKeeper.start();
        this.condition.updateAndDelayHide('Engaged!', '#FF9999');
        this.opening.hide();
    },

    setupSoundEffect: function() {
        var sound = new Sound();
        this.sounds = {};
        this.sounds.hit = sound.createAudio('/se/hit.mp3');
        this.sounds.lose = sound.createAudio('/se/lose.mp3');
        this.sounds.newtype = sound.createAudio('/se/newtype.mp3');
        this.sounds.attack = sound.createAudio('/se/attack.mp3');
        this.sounds.megaCannon = sound.createAudio('/se/mega.mp3');
        this.sounds.funnelGo = sound.createAudio('/se/funnel1.mp3');
        this.sounds.funnelAtk = sound.createAudio('/se/funnel2.mp3');
        this.sounds.iField = sound.createAudio('/se/at_field.mp3');
    },

    setupShip: function() {
        switch (this.sync.controlShip) {
            case 'white':
                this.setupShipAsWhite();
                break;
            case 'red':
                this.setupShipAsRed();
                break;
        }
    },

    setupShipAsWhite: function() {
        this.ship = new ShipWhite(false);
        this.ship.setSoundHit(this.sounds.hit);
        this.ship.setSoundLose(this.sounds.lose);
        this.enemy = new ShipRed(true);

        this.weapons = {};
        this.weapons.ship = new Weapon(this.ship, this.enemy);
        this.weapons.ship.setSoundAttack(this.sounds.attack);
        this.weapons.ship.setSoundMegaCannon(this.sounds.megaCannon);
        this.weapons.ship.setSoundFunnelGo(this.sounds.funnelGo);
        this.weapons.ship.setSoundFunnelAttack(this.sounds.funnelAtk);
        this.weapons.enemy = new Weapon(this.enemy, this.ship);
        this.weapons.enemy.addIField();
        this.weapons.enemy.addFunnelDefences();

        this.action = new ActionShipWhite();

        this.cmd = {};
        this.cmd.ship = new CommandShipWhite(this.ship, this.weapons.ship);
        this.cmd.enemy = new CommandShipRed(this.enemy, this.weapons.enemy);

        this.sync.listenShipWhiteCommand(this.cmd.ship, this.ship);
        this.sync.listenShipRedCommand(this.cmd.enemy, this.enemy);
        this.sync.setShipRedWeapon(this.weapons.enemy);
    },

    setupShipAsRed: function() {
        this.ship = new ShipRed(false);
        this.ship.setSoundHit(this.sounds.hit);
        this.ship.setSoundLose(this.sounds.lose);
        this.ship.setSoundNewtype(this.sounds.newtype);
        this.enemy = new ShipWhite(true);

        this.weapons = {};
        this.weapons.ship = new Weapon(this.ship, this.enemy);
        this.weapons.ship.addIField(this.sounds.iField);
        this.weapons.ship.addFunnelDefences();
        this.weapons.ship.setSoundAttack(this.sounds.attack);
        this.weapons.ship.setSoundFunnelGo(this.sounds.funnelGo);
        this.weapons.ship.setSoundFunnelAttack(this.sounds.funnelAtk);
        this.weapons.enemy = new Weapon(this.enemy, this.ship);

        this.action = new ActionShipRed();

        this.cmd = {};
        this.cmd.ship = new CommandShipRed(this.ship, this.weapons.ship);
        this.cmd.enemy = new CommandShipWhite(this.enemy, this.weapons.enemy);

        this.sync.listenShipRedCommand(this.cmd.ship, this.ship);
        this.sync.listenShipWhiteCommand(this.cmd.enemy, this.enemy);
        this.sync.setShipRedWeapon(this.weapons.ship);
    },

    setupTimeKeeper: function() {
        this.timeKeeper = new TimeKeeper();
    },

    setupGame: function() {
        this.game = new Game(this.routine.bind(this));
    },

    routine: function() {
        this.sync.chat.move();
        this.ship.move();
        this.enemy.move();
        this.weapons.ship.move();
        this.weapons.enemy.move();
        if (!this.action) {
            return;
        }
        if (this.ship.getHitPoint() === 0) {
            this.finish(false);
            return;
        }
        this.pushCommand(this.action.getCommand());
    },

    finish: function(isWin) {
        this.action.stop();
        this.timeKeeper.stop();
        this.game.stop();
        this.sync.stop();
        this.condition.update(
            isWin ? 'You win.' : 'You lose.',
            isWin ? '#9999FF' : '#FF9999'
        );
    },

    pushCommand: function(cmd) {
        switch (this.sync.controlShip) {
            case 'white':
                this.sync.pushShipWhiteCommand(cmd);
                break;
            case 'red':
                this.sync.pushShipRedCommand(cmd);
                break;
        }
    },

    renderElements: function() {
        new Background().renderElement();
        this.timeKeeper.renderElement();
        this.ship.renderElement();
        this.enemy.renderElement();
    }
});
