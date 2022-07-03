module.exports = {
    PlatformOverrides: function (Platform, OverrideType, Side) {
        let value = '';
        if (OverrideType === 'Icon') {
          switch (Platform) {
            case 'FARP': value = 'wrench'; break;
            case 'Pilot': value = 'male'; break;
            case 'KC-135':
            case 'S-3B Tanker':
            case 'KC135MPRS': value = 'https://atwar.online/assets/images/icons/KC130-blue.png'; break;
          }
        } else if (OverrideType === 'Layer') {
          switch (Platform) {
            case 'FARP': value = 'Airports'; break;
            case 'Pilot': value = 'Parachutists'; break;
            case 'SA-18 Igla-S manpad': value = Side + 'SAMs'; break;
            case 'S-300PS 5P85D ln': value = Side + 'SAMs'; break;
            case 'S-300PS 5P85C ln': value = Side + 'SAMs'; break;
            case 'ZSU-23-4 Shilka': value = Side + 'SAMs'; break;
            case 'rapier_fsa_launcher':; value = Side + 'SAMs'; break;
            case 'Hawk ln': value = Side + 'SAMs'; break;
            case 'Kub 2P25 ln': value = Side + 'SAMs'; break;
            case 'S_75M_Volhov': value = Side + 'SAMs'; break;
            case 'Tor 9A331': value = Side + 'SAMs'; break;
            case 'Strela-10M3': value = Side + 'SAMs'; break;
            case '2S6 Tunguska': value = Side + 'SAMs'; break;
            case 'SA-11 Buk CC 9S470M1': value = Side + 'SAMs'; break;
            case 'M48 Chaparral': value = Side + 'SAMs'; break;
            case 'M1097 Avenger': value = Side + 'SAMs'; break;
            case 'Osa 9A33 ln': value = Side + 'SAMs'; break;
            case '5p73 s-125 ln': value = Side + 'SAMs'; break;
            case 'Strela-1 9P31': value = Side + 'SAMs'; break;
            case 'SA-18 Igla manpad': value = Side + 'SAMs'; break;
            case 'Igla manpad INS': value = Side + 'SAMs'; break;
            case 'Patriot ln': value = Side + 'SAMs'; break;
          }
        } else if (OverrideType === 'Radius') {
          switch (Platform) {
            case 'SA-18 Igla-S manpad': value = 5185; break;
            case 'S-300PS 5P85D ln': value = 74080; break;
            case 'S-300PS 5P85C ln': value = 74080; break;
            case 'ZSU-23-4 Shilka': value = 2407; break;
            case 'rapier_fsa_launcher': value = 7408; break;
            case 'Hawk ln': value = 44448; break;
            case 'Kub 2P25 ln': value = 24076; break;
            case 'S_75M_Volhov': value = 42596; break;
            case 'Tor 9A331': value = 12038; break;
            case 'Strela-10M3': value = 5185; break;
            case '2S6 Tunguska': value = 12038; break;
            case 'SA-11 Buk CC 9S470M1': value = 24076; break;
            case 'M48 Chaparral': value = 5556; break;
            case 'M1097 Avenger': value = 6852; break;
            case 'Osa 9A33 ln': value = 10000; break;
            case '5p73 s-125 ln': value = 18520; break;
            case 'Strela-1 9P31': value = 5185; break;
            case 'SA-18 Igla manpad': value = 5185; break;
            case 'Igla manpad INS': value = 5185; break;
            case 'Patriot ln': value = 100008; break;
          }
        }
        return value;
    }
};
