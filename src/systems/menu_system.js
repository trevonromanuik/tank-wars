import constants from '../constants';
import utils from '../utils';

export default class MenuSystem {

  static create_menu(ecs, data) {
    data.selected_index = 0;
    ecs.create_entity_with_components({
      menu: data
    });
  }

  static draw_menu(context, ecs) {

    const menu_id = ecs.get_entity_with_component('menu');
    const menu = ecs.get_component(menu_id, 'menu');

    if(!menu) return;

    context.save();

    context.translate(12, 12);

    context.font = '24px serif';
    context.textBaseline = 'middle';

    let max_width = 0;
    for(let i = 0; i < menu.items.length; i++) {
      const metrics = context.measureText(menu.items[i].text);
      if(metrics.width > max_width) max_width = metrics.width;
    }

    context.fillStyle = 'beige';
    context.fillRect(
      0,
      0,
      max_width + 32,
      (menu.items.length * 32) + 32
    );

    context.fillStyle = 'black';
    for(let i = 0; i < menu.items.length; i++) {
      context.fillText(
        menu.items[i].text,
        16,
        (i * 32) + 16 + 12
      );
    }

    context.beginPath();
    context.moveTo(-8, (menu.selected_index * 32) + 16);
    context.lineTo(-8, (menu.selected_index * 32) + 16 + 24);
    context.lineTo(8, (menu.selected_index * 32) + 16 + 12);
    context.fill();

    context.restore();

  }

}