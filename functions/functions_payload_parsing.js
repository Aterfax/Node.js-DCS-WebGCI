module.exports = {
    ConvertArguments: function (payload) {
        const tokens = payload.split('=');
        switch (tokens[0]) {
          case 'Type': item.Type = tokens[1]; break;
          case 'Name': item.Platform = tokens[1]; break;
          case 'Pilot': item.Pilot = tokens[1]; break;
          case 'Group': item.Group = tokens[1]; break;
          case 'Coalition': item.Coalition = tokens[1]; break;
          case 'Country': item.Country = tokens[1]; break;
        }
    },
    ConvertTransform: function (payload) {
        payload = payload.substr(2);
        item.original = payload;
        const tokens = payload.split('|');
        item.LastSeen = Math.round((new Date()).getTime() / 1000);
        for (let i = 0; i < tokens.length; i++) {
            if ((tokens[i] != null) && (tokens[i] !== '') && (tokens.length === 5)) {
                switch (i) {
                    case 0: item.lon = parseFloat(tokens[i]) + reflong; break;
                    case 1: item.lat = parseFloat(tokens[i]) + reflat; break;
                    case 2: item.alt = parseFloat(tokens[i]); break;
                    case 3: item.U = parseFloat(tokens[i]); break;
                    case 4: item.V = parseFloat(tokens[i]); break;
                }
            } else if ((tokens[i] != null) && (tokens[i] !== '')) {
                switch (i) {
                    case 0: item.lon = parseFloat(tokens[i]) + reflong; break;
                    case 1: item.lat = parseFloat(tokens[i]) + reflat; break;
                    case 2: item.alt = parseFloat(tokens[i]); break;
                    case 3: item.roll = parseFloat(tokens[i]); break;
                    case 4: item.pitch = parseFloat(tokens[i]); break;
                    case 5: item.yaw = parseFloat(tokens[i]); break;
                    case 6: item.U = parseFloat(tokens[i]); break;
                    case 7: item.V = parseFloat(tokens[i]); break;
                    case 8: item.bearing = parseFloat(tokens[i]); break;
                }
            }
        }
    }
};