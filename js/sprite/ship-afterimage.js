var ShipAfterimage = Class.create(Ship, {

    getColor: function() {
        return '#FF5555';
    },

    spot: function(top, left) {
        this.elm.setOpacity(0.2);
        this.setPos({top: top, left: left});
        this.renderElement();
        (function() { this.elm.remove(); }).bind(this).delay(0.3);
    }
});
