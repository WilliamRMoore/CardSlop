import { Renderer } from './ui/renderer';

const game = new Renderer();
game.SetUpListeners();

//debug
// function _dbJoin() {
//   const s = game.client?._db_server;
//   s?.PostMessage({
//     msgType: 'plr_join',
//     data: {
//       playerJoiningId: '_dbPlayer2',
//     },
//   });

//   s?.PostMessage({
//     msgType: 'plr_join',
//     data: {
//       playerJoiningId: '_dbPlayer3',
//     },
//   });

//   s?.PostMessage({
//     msgType: 'plr_join',
//     data: {
//       playerJoiningId: '_dbPlayer4',
//     },
//   });
// }

// (window as any)._dbJoin = _dbJoin;
