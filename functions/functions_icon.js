function SetIconAir (subtype) {
    let icon = 'unknown';
    switch (subtype) {
      case 'FixedWing': icon = 'plane'; break;
      case 'Rotorcraft': icon = 'helicopter'; break;
    }
    return icon;
  }
  
  function SetIconGround (subtype) {
    return 'fa-dot-circle-o fa-1';
  }
  
  function SetIconSea (subtype) {
    return 'ship';
  }
  
  function SetIconWeapon (subtype) {
    return 'unknown';
  }
  
  function SetIconSensor (subtype) {
    return 'unknown';
  }
  
  function SetIconNavaid (subtype) {
    return 'fa-bullseye';
  }
  
  function SetIconMisc (subtype) {
    return 'unknown';
  }
  
  module.exports = {
    SetIcon: function (Type) {
        let icon = 'unknown';
        if (Type) {
            Type = Type.split('+');
            const maintype = Type[0];
            const subtype = Type[1];
            item.maintype = maintype;
            item.subtype = subtype;
            switch (maintype) {
                case 'Air': icon = SetIconAir(subtype); break;
                case 'Ground': icon = SetIconGround(subtype); break;
                case 'Sea': icon = SetIconSea(subtype); break;
                case 'Weapon': icon = SetIconWeapon(subtype); break;
                case 'Sensor': icon = SetIconSensor(subtype); break;
                case 'Navaid': icon = SetIconNavaid(subtype); break;
                case 'Misc': icon = SetIconMisc(subtype); break;
            }
        } else {
            icon = 'unknown';
        }
        return icon;
    }
};