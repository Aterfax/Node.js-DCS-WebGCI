module.exports = {
    SetColors: function (Coalition) {
        let color = '';
        if (Coalition) {
            switch (Coalition) {
                case 'Allies': color = '#ff8080'; break;
                case 'Enemies': color = '#80e0ff'; break;
                case 'Neutrals': color = '#00ff00'; break;
                case 'Unknown': color = '#FFFF00'; break;
            }
        } else {
            color = '#ffa500';
        }
        return color;
    }
};