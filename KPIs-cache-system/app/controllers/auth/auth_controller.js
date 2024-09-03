var express = require('express');
var router = express.Router();
var CryptoJS = require('crypto-js');
const cryptKey = require('../../config/encryption').secretKey;

const createQueryFromParams = require('../../oracleDB_miniAPI/oracle_db_Controller').createQueryFromParams;
const userAuthAccessCache = require('./userAuthAccessCache_Controller');
const productionMode = require('../../config/api.config').productionMode;

// base path - /api/auth

// just get headers for logged user
router.get('/headers', (routerRequest, routerResponse) => {
  routerResponse.status(200).send();
});

// logout user and clear app cache
router.get('/logout/:ID_USER', (routerRequest, routerResponse) => {
  if (routerRequest.params.ID_USER) {
    userAuthAccessCache.deleteUserAccessFromCache(+routerRequest.params.ID_USER);
  }
  routerResponse.status(200).send();
});

router.post('/login/headers', (routerRequest, routerResponse) => {
  if (cryptKey && routerRequest.body && routerRequest.body.ME_IDENTTIFIER && routerRequest.body.ME_IDENTIFIER_TYPE) {
    const decrMeIdentif = CryptoJS.AES.decrypt(routerRequest.body.ME_IDENTTIFIER, cryptKey).toString(CryptoJS.enc.Utf8);
    let bodyToPost = {
      tablename: 'AUTH_UTILIZADOR',
      getSpecificRowsByName: ['ID', 'NOME_COMPLETO', 'NOME_ABREVIADO', 'EMAIL', 'COD_IDGI', 'ATIVO', 'COD_NIF'],
      filterByObject: {
        COD_IDGI: decrMeIdentif.toUpperCase(),
        ATIVO: productionMode && productionMode !== 'false' ? 1 : 0, // 0 lets deactivated accounts login anyway
      },
    };
    createQueryFromParams(bodyToPost)
      .then(result => {
        if (result?.length > 0) {
          let crypted = CryptoJS.AES.encrypt(JSON.stringify(result[0]), cryptKey).toString();
          routerResponse.status(200).json(crypted);
        } else {
          routerResponse.status(401).json('User not found or not active.');
        }
      })
      .catch(error => {
        console.log('\x1b[31m', error?.message);
        console.log('\x1b[0m');
        routerResponse.status(500).send(error);
      });
  } else {
    routerResponse.status(400).json('400 - Bad Request!');
  }
});

// retrieves the full menu object for the frontend to construct it, based on the user permissions via user id e perfil id
router.get('/user/:ID_USER/menuitems/perfil/:ID_TIPO_PERFIL', (routerRequest, routerResponse) => {
  if (routerRequest.params.ID_USER && routerRequest.params.ID_TIPO_PERFIL) {
    let bodyToPost = {
      tablename: 'AUTH_UTILIZADOR_PERFIL',
      getSpecificRowsByName: ['AUTH_PERFIL_ID'],
      filterByObject: {
        AUTH_UTILIZADOR_ID: routerRequest.params.ID_USER,
        AUTH_PERFIL_ID: routerRequest.params.ID_TIPO_PERFIL,
      },
    };

    createQueryFromParams(bodyToPost)
      .then(result => {
        let perfil = result[0];
        if (perfil) {
          let bodyToPostMENU = {
            tablename: 'AUTH_PERFIL_MENU',
            getSpecificRowsByName: ['MENU'],
            filterByObject: {
              AUTH_PERFIL_ID: perfil.AUTH_PERFIL_ID,
            },
          };

          createQueryFromParams(bodyToPostMENU)
            .then(resultMENU => {
              let menu = resultMENU[0];
              if (menu) {
                let crypted = CryptoJS.AES.encrypt(JSON.stringify(menu), cryptKey).toString();
                routerResponse.status(200).json(crypted);
              } else {
                routerResponse.status(404).send();
              }
            })
            .catch(error => {
              console.log('\x1b[31m', error?.message);
              console.log('\x1b[0m');
              routerResponse.status(500).send(error?.message);
            });
        } else {
          routerResponse.status(404).send();
        }
      })
      .catch(error => {
        console.log('\x1b[31m', error?.message);
        console.log('\x1b[0m');
        routerResponse.status(500).send(error?.message);
      });
  } else {
    routerResponse.status(400).send();
    return;
  }
});

// retrieves all profiles types from a user id
router.get('/user/:ID_USER/tipos-perfil', (routerRequest, routerResponse) => {
  if (routerRequest.params.ID_USER) {
    userAuthAccessCache
      .getUserAcessDataFromCache(routerRequest.params.ID_USER, 'profiles-types-list')
      .then(cachedData => {
        if (cachedData?.length) {
          let crypted = CryptoJS.AES.encrypt(JSON.stringify(cachedData), cryptKey).toString();
          routerResponse.status(200).json(crypted);
        } else {
          routerResponse.status(401).send('User has no valid profiles types list!');
        }
      })
      .catch(error => {
        console.log(error);
        routerResponse.status(500).send(error?.message);
      });
  } else {
    routerResponse.status(400).send();
    return;
  }
});

router.get('/get-agrupamentos-from-user/:ID_USER', (routerRequest, routerResponse) => {
  if (routerRequest.params.ID_USER) {
    userAuthAccessCache
      .getUserAcessDataFromCache(routerRequest.params.ID_USER, 'agrupamentos-ids-list')
      .then(cachedData => {
        routerResponse.status(200).send(cachedData ?? []);
      })
      .catch(error => {
        console.log(error);
        routerResponse.status(500).send(error?.message);
      });
  } else {
    routerResponse.status(400).json('400 - Bad Request!');
  }
});

module.exports = router;
