import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = new FormGroup({
      name: new FormControl(
        '',
        Validators.compose([Validators.required, Validators.minLength(3)])
      ),
      email: new FormControl('', Validators.compose([Validators.required])),
      password: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.authService.signup(
      this.form.value.name,
      this.form.value.email,
      this.form.value.password
    );
  }
}
