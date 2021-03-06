'use strict';

var _cameraController = require('./controllers/cameraController');

var _cameraController2 = _interopRequireDefault(_cameraController);

var _hostController = require('./controllers/hostController');

var _hostController2 = _interopRequireDefault(_hostController);

var _monitoringAreaController = require('./controllers/monitoringAreaController');

var _monitoringAreaController2 = _interopRequireDefault(_monitoringAreaController);

var _perimeterController = require('./controllers/perimeterController');

var _perimeterController2 = _interopRequireDefault(_perimeterController);

var _perimeterPointController = require('./controllers/perimeterPointController');

var _perimeterPointController2 = _interopRequireDefault(_perimeterPointController);

var _eventController = require('./controllers/eventController');

var _eventController2 = _interopRequireDefault(_eventController);

var _userController = require('./controllers/userController');

var _userController2 = _interopRequireDefault(_userController);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by chen on 17-8-22.
 */

var router = new _koaRouter2.default();
router.prefix('/api');
// module.exports.initialize = function () {
//     router.get('/', async (ctx, next) => {
//         await ctx.render('index.pug');
//     });
// };

router.get('/cameras', _cameraController2.default.find_camera).get('/cameras/:id', _cameraController2.default.find_one).post('/cameras', _cameraController2.default.add_camera).put('/cameras/:id', _cameraController2.default.edit_camera).delete('/cameras/:id', _cameraController2.default.delete_camera);

//主机路由
router.get('/hosts', _hostController2.default.find_host).get('/hosts/:id/show', _hostController2.default.find_one).post('/hosts/create', _hostController2.default.add_host).put('./hosts/:id', _hostController2.default.edit_host).delete('/hosts/:id/delete', _hostController2.default.delete_host);

//监控区域路由
router.get('/monitoringArea', _monitoringAreaController2.default.find_monitoringArea).get('/monitoringArea/:id', _monitoringAreaController2.default.find_one).post('/monitoringArea', _monitoringAreaController2.default.add_monitoringArea).put('./monitoringArea/:id', _monitoringAreaController2.default.edit_monitoringArea).delete('/monitoringArea/:id', _monitoringAreaController2.default.delete_monitoringArea);

//周界路由
router.get('/perimeter', _perimeterController2.default.find_perimeter).get('/perimeter/:id', _perimeterController2.default.find_one).post('/perimeter', _perimeterController2.default.add_perimeter).put('./perimeter/:id', _perimeterController2.default.edit_perimeter).delete('/perimeter/:id', _perimeterController2.default.delete_perimeter);

//周界点路由
router.get('/perimeterPoint', _perimeterPointController2.default.find_perimeterPoint).get('/perimeterPoint/:id', _perimeterPointController2.default.find_one).post('/perimeterPoint', _perimeterPointController2.default.add_perimeterPoint).put('./perimeterPoint/:id', _perimeterPointController2.default.edit_perimeterPoint).delete('/perimeterPoint/:id', _perimeterPointController2.default.delete_perimeterPoint);

//事件路由
router.get('/event', _eventController2.default.find_event).get('/event/:id', _eventController2.default.find_one).post('/event', _eventController2.default.add_event).put('./event/:id', _eventController2.default.edit_event).delete('/event/:id', _eventController2.default.delete_event);

//用户路由
router.post('/user', _userController2.default.create_user);

module.exports = router;
//# sourceMappingURL=router.js.map