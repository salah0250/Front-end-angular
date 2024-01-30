import { Component, OnInit,ViewEncapsulation  } from '@angular/core';
import { Assignment } from './assignment.model';
import { Router } from '@angular/router';
import { LayoutService } from  '../services/LayoutService';
import { Observable } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0, transform: 'translateY(-20px)' })),
      ]),
    ]),
  ]
  
  
})
export class AssignmentsComponent implements OnInit {
  showLayout$: Observable<boolean>;
  titre : String = "Mon application Angular sur les assignments"
  assignments:Assignment[] = [];
// In your component
imageSource = '../../assets/UCA.png';
  constructor(private router: Router,private layoutService: LayoutService) {
    this.showLayout$ = this.layoutService.showLayout$;
   }
    ajoutActive = false;
    nomDevoir:string = "";
    dateDeRendu!:Date;
    opened = false;
    toggleMenu() {
      this.opened = !this.opened;
    }
  // In your component TypeScript file
  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
    onSubmit() {
      const newAssignment = new Assignment();
      newAssignment.nom = this.nomDevoir;
      newAssignment.auteurs = localStorage.getItem('currentUser') || '';
      newAssignment.dateDeRendu = this.dateDeRendu ;
      newAssignment.rendu = true;
      this.assignments.push(newAssignment);
    }
   
  ngOnInit(): void {
    this.showLayout$ = this.layoutService.showLayout$;
    setTimeout  (() => {
      this.ajoutActive = true;
    } , 2000);
  }

}
