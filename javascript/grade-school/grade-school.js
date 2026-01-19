export class GradeSchool {
  constructor() {
    this._roster = {};
  }

  roster() {
    // Return a deep copy of the roster with sorted students
    const rosterCopy = {};
    for (const grade in this._roster) {
      rosterCopy[grade] = [...this._roster[grade]].sort();
    }
    return rosterCopy;
  }

  add(name, grade) {
    // Remove student from any other grade if they already exist
    for (const g in this._roster) {
      const index = this._roster[g].indexOf(name);
      if (index !== -1) {
        this._roster[g].splice(index, 1);
        // Clean up empty grade arrays
        if (this._roster[g].length === 0) {
          delete this._roster[g];
        }
      }
    }

    // Add student to the new grade
    if (!this._roster[grade]) {
      this._roster[grade] = [];
    }
    this._roster[grade].push(name);
  }

  grade(gradeNumber) {
    // Return a sorted copy of students in the given grade
    if (!this._roster[gradeNumber]) {
      return [];
    }
    return [...this._roster[gradeNumber]].sort();
  }
}
