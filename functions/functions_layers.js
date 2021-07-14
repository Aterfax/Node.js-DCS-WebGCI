module.exports = {
    SetLayer: function (Type) {
        let layer = 'NoLayer';
        if (Type) {
            Type = Type.split('+');
            const maintype = Type[0];
            switch (maintype) {
                case 'Air': layer = 'Aircraft'; break;
                case 'Ground': layer = 'Ground Vehicles'; break;
                case 'Sea': layer = 'Seacraft'; break;
                case 'Weapon': layer = 'Weapons'; break;
                case 'Sensor': layer = 'Sensors'; break;
                case 'Navaid': layer = 'Navaids'; break;
                case 'Misc': layer = 'Misc'; break;
            }
        } else {
            layer = 'NoType';
        }
        return layer;
    }
};