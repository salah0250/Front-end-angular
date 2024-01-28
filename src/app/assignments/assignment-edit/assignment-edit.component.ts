import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignmentService } from '../../services/assignmentService';
import { Assignment } from './assignment-edit.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
 selector: 'app-edit-assignment',
 templateUrl: './assignment-edit.component.html',
 styleUrls: ['./assignment-edit.component.css'],
})
export class AssignmentEditComponent implements OnInit {
 assignment!: Assignment | undefined;
 nomAssignment!: string;
 dateDeRendu!: Date;
 nomMatiere:string = "";
 matiere!: string;
 Notes!: number;
 Remarque!: string;
 matieres: string[] = ['Math pour Big Data', '	Programmation Avancée', 'Planification de Projet', 'Systeme information','Fonctionnement de SGBD' , 'JavaScript et HTML5'];

 constructor(
   private assignmentsService: AssignmentService,
   private route: ActivatedRoute,
   private router: Router,private snackBar: MatSnackBar
 ) {}

 ngOnInit(): void {
   this.getAssignment();
 }

getAssignment() {
   // on récupère l'id dans le snapshot passé par le routeur
   // le "+" force l'id de type string en "number"
   const id = +this.route.snapshot.params['id'];
  
   this.assignmentsService.getAssignment(id).subscribe(assignment => {
     if (!assignment) return;
     this.assignment = assignment;
     // Pour pré-remplir le formulaire
     this.nomAssignment = assignment.nom;
     this.dateDeRendu = assignment.dateDeRendu;
      this.Notes = assignment.Notes;
      this.Remarque = assignment.Remarque;
     
   });
 }
 onSaveAssignment() {
  if (!this.assignment) return;
  if (this.nomAssignment) this.assignment.nom = this.nomAssignment;
  if (this.dateDeRendu) this.assignment.dateDeRendu = this.dateDeRendu;
  if (this.Notes) this.assignment.Notes = this.Notes;
  if (this.Remarque) this.assignment.Remarque = this.Remarque;
  if (this.nomMatiere) {
    if (typeof this.assignment.matiere === 'object' && this.assignment.matiere !== null) {
      // Use a type assertion to tell TypeScript that this.assignment.matiere is of the type that has a non_matiere property
      (this.assignment.matiere as { non_matiere: string }).non_matiere = this.nomMatiere;
    } else {
      this.assignment.matiere = { non_matiere: this.nomMatiere };
    }
  }

  // on récupère les valeurs dans le formulaire
  this.assignmentsService.updateAssignment(this.assignment)
  .subscribe(response => { console.log(response.message); });
  this.router.navigate(['/assignment-detail', this.assignment.id]);
  this.snackBar.open('Devoir Modifier!', 'Fermer', {
    duration: 3000, // Durée d'affichage du SnackBar en millisecondes
    horizontalPosition: 'end', // Position horizontale du SnackBar (start, center, end)
    verticalPosition: 'top', // Position verticale du SnackBar (top, bottom)
  });
}
}
