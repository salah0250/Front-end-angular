import { Component, OnInit, ViewChild } from '@angular/core';
import { Assignment } from './ajout-devoir.model';
import { Router } from '@angular/router';
import { AssignmentService } from '../services/assignmentService';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, map, of } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';


@Component({
  selector: 'app-ajout-devoir',
  templateUrl: './ajout-devoir.component.html',
  styleUrls: ['./ajout-devoir.component.css']
})
export class AjoutDevoirComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

[x: string]: any;

  titre : String = "Mon application Angular sur les assignments"
  assignments:Assignment[] = [];

  constructor(private router : Router,private assignmentService: AssignmentService,private snackBar: MatSnackBar,private authService: AuthenticationService ) { }
    ajoutActive = false;
    nomDevoir:string = "";
    nomMatiere:string = "";
    dateDeRendu!:Date;
    opened = false;
    matieres: string[] = ['Math pour Big Data', '	Programmation Avancée', 'Planification de Projet', 'Systeme information','Fonctionnement de SGBD' , 'JavaScript et HTML5'];
    toggleMenu() {
      this.opened = !this.opened;
    }
    next(stepper: MatStepper) {
      stepper.next();
    }
    onSubmit() {
      if(this.canView()){
    
      const newAssignment = new Assignment();
    newAssignment.id = Math.floor(Math.random() * 1000);

    // Get user object from localStorage
    let currentUser = localStorage.getItem('currentUser');

    // Use email as the author
    if (!currentUser) {
      return;
    }
    console.log('currentUser', JSON.parse(currentUser).Nom);
    newAssignment.auteurs = JSON.parse(currentUser).Nom; // Use the user's name
    newAssignment.nom = this.nomDevoir;
    newAssignment.dateDeRendu = this.dateDeRendu;
    newAssignment.rendu = false;

    // Assign the subject name
    newAssignment.matiere = this.nomMatiere;

    this.assignments.push(newAssignment);
    
    // Call the service to add the assignment
    this.assignmentService.addAssignment(newAssignment)
      .subscribe(response => {
        console.log(response.message);
        // Navigate to the assignment detail page
        this.router.navigate(['/assignment-detail', newAssignment.id]);
      });

    console.log(this.assignments); 
   
    this.snackBar.open('Devoir ajouté avec succès!', 'Fermer', {
      duration: 3000, // Durée d'affichage du SnackBar en millisecondes
      horizontalPosition: 'end', // Position horizontale du SnackBar (start, center, end)
      verticalPosition: 'top', // Position verticale du SnackBar (top, bottom)
    });
  } else {
    this.router.navigate(['/login']);
  }
}
 

  canView(): Observable<boolean> {
    const currentUserItem = localStorage.getItem('currentUser');
    if (currentUserItem) {
      const user = JSON.parse(currentUserItem);
      return this.authService.isprof(user.Email, user.password) || this.authService.isAdmin(user.Email, user.password) || this.authService.isetudiant(user.Email, user.password);
    }
    return of(false);
  }
  ngOnInit(): void {
    if (this.canView()){
    this.snackBar.open('Vous devez etre connecter pour utiliser App!', 'Fermer', {
      duration: 1000, // Durée d'affichage du SnackBar en millisecondes
      horizontalPosition: 'end', // Position horizontale du SnackBar (start, center, end)
      verticalPosition: 'top', // Position verticale du SnackBar (top, bottom)
    });
  }
    setTimeout  (() => {
      this.ajoutActive = true;
    } , 2000);
  }

}
