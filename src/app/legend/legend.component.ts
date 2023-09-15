import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
})

export class LegendComponent {
  private visibility_legend = true;
  @Output() changings = new EventEmitter<boolean>();

  constructor() { }

  hideBtnLegend() {
    const btnLegend = document.getElementById('buttonDiv');
    if (btnLegend !== null)
      btnLegend.style.display = 'none';
  }

  hideLegend() {
    const legend = document.getElementById('legendDiv');
    if (legend !== null)
      legend.style.display = 'none';
  }

  showLegend() {
    const legend = document.getElementById('legendDiv');
    if (legend !== null)
      legend.style.display = 'block';
  }

  change_visibility_legend() {
    const btn = document.getElementById('btn');
    if (btn !== null) {
      if (this.visibility_legend === true) {
        this.hideLegend();
        btn.textContent = 'Show legend';
        this.visibility_legend = false;
        this.changings.emit(this.visibility_legend);
        return;
      }
      else {
        this.showLegend();
        btn.textContent = 'Hide legend';
        this.visibility_legend = true;
        this.changings.emit(this.visibility_legend);
        return;
      }
    }
    return;
  }

  synch_visibility_legend(visibility_synch: boolean) {
    const btn = document.getElementById('btn');
    if (btn !== null) {
      if (visibility_synch === false) {
        this.hideLegend();
        btn.textContent = 'Show legend';
        this.visibility_legend = false;
        return;
      }
      else {
        this.showLegend();
        btn.textContent = 'Hide legend';
        this.visibility_legend = true;
      }
    }
  }
}
