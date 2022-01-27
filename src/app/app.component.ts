import { Component } from '@angular/core';
import { Task } from './task/task';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  todo: Task[] = [
    {
      title: 'Init project',
      description: 'Create initial project files',
    },
    {
      title: 'Add backend',
      description: 'Implement server-side logic',
    },
  ];
}
