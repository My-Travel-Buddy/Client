# My Travel Buddy — Final Database Design

## Tables

1. `users`
2. `trips`
3. `activities`
4. `checklist_items`

## DBML

```dbml
Table users {
  id integer [pk, increment]
  username varchar [not null]
  email varchar [not null, unique]
  password_hash varchar [not null]
  passport_country varchar
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
}

Table trips {
  id integer [pk, increment]
  user_id integer [not null]
  title varchar [not null]
  destination varchar [not null]
  start_date date [not null]
  end_date date [not null]
  budget_level varchar [not null]
  interests json [not null]
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
}

Table activities {
  id integer [pk, increment]
  trip_id integer [not null]
  title varchar [not null]
  category varchar
  activity_date date [not null]
  time_of_day varchar
  location varchar
  estimated_cost decimal(10,2)
  notes text
  source varchar [not null, default: 'Manual']
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
}

Table checklist_items {
  id integer [pk, increment]
  trip_id integer [not null]
  text varchar [not null]
  category varchar
  priority varchar [not null, default: 'Recommended']
  completed boolean [not null, default: false]
  source varchar [not null, default: 'Manual']
  createdAt timestamp [not null]
  updatedAt timestamp [not null]
}

Ref: trips.user_id > users.id [delete: cascade]
Ref: activities.trip_id > trips.id [delete: cascade]
Ref: checklist_items.trip_id > trips.id [delete: cascade]
```

## Associations

```text
User.hasMany(Trip)
Trip.belongsTo(User)

Trip.hasMany(Activity)
Activity.belongsTo(Trip)

Trip.hasMany(ChecklistItem)
ChecklistItem.belongsTo(Trip)
```

## Delete Behavior

```text
Delete user → delete user's trips
Delete trip → delete activities
Delete trip → delete checklist items
```

## Recommended Values

### Activity source

```text
AI
Manual
```

### Checklist priority

```text
Essential
Recommended
```

### Checklist source

```text
Generated
Manual
```
