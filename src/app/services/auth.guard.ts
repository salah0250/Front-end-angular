import { Assignment } from '../assignments/assignment.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({
    providedIn: 'root'
  })
  export class AuthGuard implements CanActivate {
    constructor(private router: Router,private snackBar: MatSnackBar) {}
  
    canActivate(route: ActivatedRouteSnapshot): boolean {
      const currentUserItem = localStorage.getItem('currentUser');
      if (currentUserItem) {
        const currentUser = JSON.parse(currentUserItem);
        if (currentUser) {
          // Check the user's role and the route they're trying to access
          if (route.routeConfig && route.routeConfig.path && route.routeConfig.path.includes('assignment-detail/:id/assignment-edit') && currentUser.role !== 'admin' && currentUser.role !== 'enseignant') {
            // If the user is not an admin and they're trying to access the assignment-edit route, redirect them
            this.snackBar.open('Vous devez etre un admin ou enseignant!', 'Fermer', {
              duration: 3000, // Durée d'affichage du SnackBar en millisecondes
              horizontalPosition: 'end', // Position horizontale du SnackBar (start, center, end)
              verticalPosition: 'top', // Position verticale du SnackBar (top, bottom)
            });
            this.router.navigate(['/login']);
            return false;
          } else if (route.routeConfig && route.routeConfig.path && route.routeConfig.path.includes('delete') && currentUser.role !== 'enseignantss' && currentUser.role !== 'admin') {
            this.snackBar.open('Vous devez etre un admin ou enseignant!', 'Fermer', {
              duration: 3000, // Durée d'affichage du SnackBar en millisecondes
              horizontalPosition: 'end', // Position horizontale du SnackBar (start, center, end)
              verticalPosition: 'top', // Position verticale du SnackBar (top, bottom)
            });
            // If the user is not a teacher and they're trying to access the delete route, redirect them
            this.router.navigate(['/login']);
            return false;
          }
          // If none of the above conditions are met, allow the user to access the route
          return true;
        }
      }
      localStorage.setItem('redirectUrl', route.url.join('/'));
      this.router.navigate(['/login']);
      return false;
    }
    

  }