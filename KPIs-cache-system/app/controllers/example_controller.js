var express = require('express');
var router = express.Router();
const { ObjectId } = require('bson');

// base route: /api/configs/centrais

const ED_ART_CONF_CENTRAIS_MODEL = require('../../schema/configuracoes/ED_ART_CONF_CENTRAIS_Schema').ED_ART_CONF_CENTRAIS_MODEL;

// obter os contratos patrocinio registados, incluindo os ocultos
router.get('/getall-contr-patrc', (routerRequest, routerResponse) => {
  ED_ART_CONF_CENTRAIS_MODEL.findOne({})
    .lean()
    .then(data => {
      if (data && data.contrPatrocinioConfigurados && data.contrPatrocinioConfigurados.length > 0) {
        routerResponse.status(200).send(data.contrPatrocinioConfigurados);
      } else {
        routerResponse.status(200).send([]);
      }
    })
    .catch(error => {
      routerResponse.status(500).send(error);
      console.log(error);
    });
});

module.exports = router;
