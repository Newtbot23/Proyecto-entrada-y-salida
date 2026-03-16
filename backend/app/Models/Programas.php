<?php
 
 namespace App\Models;
 
 use Illuminate\Database\Eloquent\Model;
 
 class Programas extends Model
 {
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['id', 'programa'];
 }
