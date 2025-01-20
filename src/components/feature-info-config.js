// Configuration for key blacklists per layer
export const keyBlacklists = {
    'vfs:standorte': ['gid', 'geom', 'internal_id', 'standorte_id', 'waldbesitzer', 'color'],
    'vfs:kartiergebiete': ['gid', 'geom', 'created_by', 'color'],
    // Add more layer-specific blacklists as needed
  };
  
  // Configuration for key translations
  export const keyTranslations = {
    'vfs:standorte': {
      'sto_name': 'Standort Boden',
      'year': 'Jahr',
      'description': 'Beschreibung',
      'area': 'Fläche (ha)',
      // Add more key translations as needed
    },
    'vfs:kartiergebiete': {
        'sto_name': 'Standort Boden',
        'year': 'Jahr',
        'description': 'Beschreibung',
        'area': 'Fläche (ha)'
    }
  };
  


  // Helper function to get rating information
const getRatingInfo = (value) => {
    if (!value) return null;
    
    const ratings = {
      '1/1': {
        color: '#00FF00',
        description: 'Geeignet. gute Wert- und Wuchsleistung bei guter ökologischer Eignung'
      },
      '1/2': {
        color: '#00FF00',
        description: 'Geeignet. gute Wert- und Wuchsleistung bei mittlerer ökologischer Eignung'
      },
      '2/1': {
        color: '#00FF00',
        description: 'Geeignet. mittlere Wert- und Wuchsleistung bei guter ökologischer Eignung'
      },
      '1/3': {
        color: '#FFFF00',
        description: 'Möglich. gute Wert- und Wuchsleistung bei schlechter ökologischer Eignung'
      },
      '2/2': {
        color: '#FFFF00',
        description: 'Möglich. mittlere Wert- und Wuchsleistung bei mittlerer ökologischer Eignung'
      },
      '3/1': {
        color: '#FFFF00',
        description: 'Möglich. schlechte Wert- und Wuchsleistung bei guter ökologischer Eignung'
      },
      '2/3': {
        color: '#FF9900',
        description: 'wenig geeignet. mittlere Wert- und Wuchsleistung bei schlechter ökologischer Eignung'
      },
      '3/2': {
        color: '#FF9900',
        description: 'wenig geeignet. schlechte Wert- und Wuchsleistung bei mittlerer ökologischer Eignung'
      },
      '3/3': {
        color: '#FF0000',
        description: 'Ungeeignet. schlechte Wert- und Wuchsleistung bei schlechter ökologischer Eignung'
      }
    };
  
    return ratings[value];
  };
  
  export const valueTransformers = {
    'vfs:standorte': {
      'year': (value) => {
        if (!value) return 'N/A';
        try {
          const date = new Date(value);
          return new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).format(date);
        } catch {
          return value;
        }
      },
      'area': (value) => {
        if (!value) return 'N/A';
        return Number(value).toFixed(2);
      },
      // Tree species transformers
      'fichte': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'tanne': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'ela': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'douglasie': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'kiefer': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'buche': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'bergahorn': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'esche': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'winterlinde': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'schwarzerle': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'kirsche': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'eiche': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'traubeneiche': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      },
      'stieleiche': (value) => {
        const info = getRatingInfo(value);
        if (!info) return 'keine Angabe';
        return `<span style="background-color: ${info.color}; padding: 2px 6px; border-radius: 4px;">${value}</span> - ${info.description}`;
      }
    },
    'vfs:kartiergebiete': {
        'year': (value) => {
          if (!value) return 'N/A';
          try {
            const date = new Date(value);
            return new Intl.DateTimeFormat('de-DE', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).format(date);
          } catch {
            return value;
          }
        },
        'area': (value) => {
          if (!value) return 'N/A';
          return Number(value).toFixed(2);
        }
      }
  };
  
  // Utility function to check if a key should be blacklisted
  export const isKeyBlacklisted = (layerName, key) => {
    const blacklist = keyBlacklists[layerName] || [];
    return blacklist.includes(key);
  };
  
  // Utility function to translate key names
  export const translateKey = (layerName, key) => {
    const translations = keyTranslations[layerName] || {};
    return translations[key] || formatKeyDefault(key);
  };
  
  // Default key formatting function
  export const formatKeyDefault = (key) => {
    // Convert snake_case to Title Case
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Utility function to transform values
  export const transformValue = (layerName, key, value) => {
    const transformers = valueTransformers[layerName] || {};
    const transformer = transformers[key];
    return transformer ? transformer(value) : value;
  };