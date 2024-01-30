import { Component, OnInit,Input,OnDestroy } from '@angular/core';
import { Assignment } from './assignment-detail.model';
import { AssignmentService } from '../../services/assignmentService';
import { Observable, Subscription, catchError, endWith, map, of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { HttpClient } from '@angular/common/http';
import {MatTableModule} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SimpleChanges } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-assignment-detail',
  templateUrl: './assignment-detail.component.html',
  styleUrls: ['./assignment-detail.component.css'],
  animations: [
    trigger('rowHover', [
      state('normal', style({ background: 'inherit', transform: 'translateY(0)' })),
      state('hovered', style({ background: 'aqua', transform: 'translateY(-5px)' })),
      transition('normal <=> hovered', animate('0.3s ease-in-out')),
    ]),
  ],
})

export class AssignmentDetailComponent implements OnInit ,OnDestroy{
  hoveredAssignment: Assignment | null = null;
  /*@Input()*/ assignementTransmis?:Assignment  ;
  sortingOrder: 'asc' | 'desc' = 'asc';
  private assignmentsSub: Subscription;
  nombredevoir:number = 0;
  titre : String = "Mon application Angular sur les assignments"
  pageSize = 10; // Adjust the page size as per your requirement
  currentPage = 0;
  searchTerm: string = ''; // Variable to store the search term
  filterOptions = [
    { label: 'Tous', value: 'true&selectedFilter=false'},
    { label: 'Rendu', value: true },
    { label: 'Non Rendu', value: false },
  ];
  
  selectedFilter: boolean | null = 'true&selectedFilter=false' as any;
  clickedAssignmentPosition = { top: 0, left: 0 };
  isNextButtonDisabled(): boolean {
    if (!this.assignments || this.assignments.length === 0) {
      return true; // No assignments, disable "Next" button
    }
  
    const totalAssignments = this.assignments.length;
    const totalPages = Math.ceil(totalAssignments / this.pageSize);
    return this.currentPage >= totalPages - 1 || (this.currentPage + 1) * this.pageSize >= totalAssignments;
  }
  
  
  
  assignmentClique(assignment: Assignment, event: MouseEvent) {
    if (this.assignmentSelectionne && this.assignmentSelectionne.id === assignment.id) {
      this.assignmentSelectionne = null;
    } else {
      this.assignmentSelectionne = assignment;
      if (event instanceof MouseEvent) {
        // Add an offset to move the mat-card closer to the assignment
        if (this.assignments.length >= 20) {
          const offset = -300;
          this.clickedAssignmentPosition = {
            top: event.clientY - offset,
            left: event.clientX,
          };
        } else {
          const offset = 150;
          this.clickedAssignmentPosition = {
            top: event.clientY - offset,
            left: event.clientX - offset + 100,
          };
        }
      }
    }
  }
  
  
  onAssignmentRendu() {
    if (this.assignmentSelectionne) {
      this.assignmentSelectionne.rendu = true;
      this.assignmentService.updateAssignment(this.assignmentSelectionne).subscribe(response => {
        console.log(response.message);
        // Mettez à jour la liste des affectations après la modification
        this.loadAssignments();
      });
    }
  }

  edit() {
    /*
    if (this.canEditOrDelete()) {
      this.router.navigate(['/assignment-edit', this.assignmentSelectionne.id]);
    }else{
      this.router.navigate(['/login']);

    }
    */
  }
  deleteAssignment(assignment: Assignment) {
    this.canEditOrDelete().subscribe(({ canDelete }) => {
      if (canDelete) {
        this.assignmentService.deleteAssignment(assignment).subscribe(response => {
          console.log(response.message);
          this.router.navigate(['/ajout-devoir']);
        });
        this.snackBar.open('Devoir Supprimer!', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
  
  canEditOrDelete(): Observable<{ canDelete: boolean }> {
    const currentUserItem = localStorage.getItem('currentUser');
    if (currentUserItem) {
      const user = JSON.parse(currentUserItem);
      return this.authService.isAdmin(user.Email, user.password).pipe(
        map(canDelete => ({ canDelete }))
      );
    }
    return of({ canDelete: false });
  }
  
  canEdit(): Observable<boolean> {
    const currentUserItem = localStorage.getItem('currentUser');
    if (currentUserItem) {
      const user = JSON.parse(currentUserItem);
      return this.authService.isprof(user.Email, user.password) || this.authService.isAdmin(user.Email, user.password);
    }
    return of(false);
  }
  
  canViewDetails(): Observable<boolean> {
    const currentUserItem = localStorage.getItem('currentUser');
    if (currentUserItem) {
      const user = JSON.parse(currentUserItem);
      return this.authService.isLogged(user.Email, user.password).pipe(
        map(role => !!role), // Convert role (string | null) to boolean
        catchError(() => of(false))
      );
    }
    return of(false);
  }
  
  assignmentSelectionne: Assignment | null = null; // Change the type
  assignments:Assignment[] = [];
  constructor(private assignmentService: AssignmentService, private cd: ChangeDetectorRef,private router : Router,private authService: AuthenticationService,private route:ActivatedRoute,    private dialog: MatDialog,private snackBar: MatSnackBar ) {
    this.assignmentsSub = new Subscription();
   }
   displayedColumns: string[] = ['auteurs','nom', 'dateDeRendu','matiere'];

    ajoutActive = false;
    nomDevoir:string = "";
    dateDeRendu!:Date;
    matiere:string = "";
    opened = false;
    toggleMenu() {
      this.opened = !this.opened;
    }
  
    onSubmit() {
      const newAssignment = new Assignment();
      newAssignment.nom = this.nomDevoir;
      newAssignment.dateDeRendu = this.dateDeRendu ;
      newAssignment.rendu = false;
      newAssignment.matiere = this.matiere;
      this.assignments.push(newAssignment);
    }
    
    onSearchChange() {
      // Trigger the assignment loading when the search term changes
      // donne a startindex la valeur 0 
      this.currentPage = 0;
      this.loadAssignments();
    }
    onFilterChange() {
  this.loadAssignments();
}
onPageSizeChange() {
  this.currentPage = 0; // Reset to the first page when changing page size
  this.loadAssignments();
}

loadAssignments() {
  const startIndex = this.currentPage * this.pageSize;
  const endIndex = Number(this.pageSize) + Number(startIndex);
  console.log('startIndex:', startIndex);
  console.log('endIndex:', endIndex);
  console.log('searchTerm:', this.searchTerm);
  console.log('selectedFilter:', this.selectedFilter);
  this.assignmentService 
    .getAssignmentsPaginated(startIndex, endIndex, this.searchTerm, this.selectedFilter)
    .subscribe((assignments) => {
      // Sort assignments based on the date
      assignments = assignments.sort((a, b) => {
        const dateA = new Date(a.dateDeRendu).getTime();
        const dateB = new Date(b.dateDeRendu).getTime();

        if (this.sortingOrder === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });

      this.assignments = assignments;
    });
}
toggleSortingOrder() {
  this.sortingOrder = this.sortingOrder === 'asc' ? 'desc' : 'asc';
  this.loadAssignments();
}



getNonMatiere(): string {
  if (this.assignmentSelectionne && typeof this.assignmentSelectionne.matiere === 'object') {
    return (this.assignmentSelectionne.matiere as { non_matiere: string }).non_matiere;
  }
  return '';
}
getProf(): string {
  if (this.assignmentSelectionne && typeof this.assignmentSelectionne.matiere === 'object') {
    return (this.assignmentSelectionne.matiere as { professeur: string }).professeur;
  }
  return '';
}getImageUrl(): string {
  if (this.assignmentSelectionne && typeof this.assignmentSelectionne.matiere === 'object') {
    return (this.assignmentSelectionne.matiere as { image: string }).image;
  }
  return '';
}
onPageChange(page: number) {
  this.currentPage = page;
  this.searchTerm = ''; // Clear the search term when changing pages
  this.assignmentSelectionne = null; // Close the mat-card
  this.loadAssignments();
}                     

  ngOnInit(): void {
    //this.assignmentService.getAssignments().subscribe(assignments => { this.assignments = assignments; });
    this.loadAssignments();
    console.log(this.assignments.length);


//this.getAssignment();
  }
  ngOnDestroy() {
    this.assignmentsSub.unsubscribe();
  }

getAssignment() {
  const id = +this.route.snapshot.params['id'];
  this.assignmentService.getAssignment(id)
  .subscribe(assignment =>  this.assignementTransmis= assignment);
}
// recuperer tous les assignments


}
