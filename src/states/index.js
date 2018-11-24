import EndTurnState from './end_turn';
import IdleState from './idle';
import MenuOpenState from './menu_open';
import SelectTargetState from './select_target';
import ShowThreatState from './show_threat';
import StartTurnState from './start_turn';
import UnitSelectedState from './unit_selected';
import UnitMovedState from './unit_moved';

export default {
  end_turn: EndTurnState,
  idle: IdleState,
  menu_open: MenuOpenState,
  select_target: SelectTargetState,
  show_threat: ShowThreatState,
  start_turn: StartTurnState,
  unit_selected: UnitSelectedState,
  unit_moved: UnitMovedState
};