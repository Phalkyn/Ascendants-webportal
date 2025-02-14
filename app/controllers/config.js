import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({    
    gameApi: service(),
    flashMessages: service(),
    router: service(),
    newConfigKey: '',
    configChanged: false,
    confirmRestore: false,
    configErrors: null,
    
    config: computed.reads('model.config'),

    
    resetOnExit: function() {
        this.set('newConfigKey', '');
        this.set('confirmRestore', false);
        this.set('configErrors', null);
    },
    
    actions: {
        
        addNew() {
            let key = this.newConfigKey;
            let modelConfig = this.get('model.config');
            if (modelConfig[key]) {
                return;
            }
            modelConfig[key] = { key: key, lines: 3, value: '', new_value: '' };
            this.set('model.config', modelConfig);
            this.set('configChanged', !this.configChanged);
        },
        
        removeKey(key) {
            let modelConfig = this.get('model.config');
            delete modelConfig[key];
            this.set('model.config', modelConfig);
            this.set('configChanged', !this.configChanged);
        },
        
        restoreDefaults() {
          let api = this.gameApi;
          this.set('confirmRestore', false);
          api.requestOne('restoreConfig', { file: this.get('model.file') }, null)
          .then( (response) => {
              if (response.error) {
                  return;
              }
      
          this.flashMessages.success('Config restored!');
          this.send('reloadModel');
          });  
        },
        
        save() {
            let api = this.gameApi;
            let modelConfig = this.get('model.config');
            let config = {};
            
            Object.keys(modelConfig).forEach( function(k) {
                config[k] = modelConfig[k].new_value;
            });

            api.requestOne('saveConfig', { file: this.get('model.file'), config: config }, null)
            .then( (response) => {
                if (response.error) {
                    return;
                }
                if (response.warnings) {
                  this.set('configErrors', response.warnings);
                  return;
                }
        
            this.flashMessages.success('Config saved!');
            this.router.transitionTo('setup');  
            });  
        }
        
    }
});