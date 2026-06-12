from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
import barcode
import qrcode
from qrcode.image.styledpil import StyledPilImage
from barcode.writer import ImageWriter
import io
from PIL import Image, ImageDraw, ImageOps
import base64
from qrcode.image.styles.moduledrawers import (
    RoundedModuleDrawer,
    SquareModuleDrawer,
    CircleModuleDrawer
)
from dotenv import load_dotenv
import os
from werkzeug.security import generate_password_hash, check_password_hash
import click
from functools import wraps
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "iskan_studio_secret_key")
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# PostgreSQL Configuration
# Note: Special characters in passwords like '$' must be URL-encoded (e.g., $ -> %24)
# DEFAULT_DB = "postgresql://postgres:Pa$$w0rd@localhost:5432/ISKANABOL"
DEFAULT_DB = os.getenv("postgress_cred")
app.config['SQLALCHEMY_DATABASE_URI'] = DEFAULT_DB
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Subscription Plan Definitions
PLANS = {
    'free': {'name': 'Free', 'limit': 1, 'price': 0},
    'basic': {'name': 'Basic', 'limit': 5, 'price': 299},
    'starter': {'name': 'Starter', 'limit': 20, 'price': 499},
    'pro': {'name': 'Pro', 'limit': 9999, 'price': 1199}
}

# Template Model
class Template(db.Model):
    __tablename__ = 'templates'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    content = db.Column(db.JSON, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "content": self.content,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if (hasattr(self, 'created_at') and self.created_at) else None
        }

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), nullable=True)
    company_name = db.Column(db.String(255), nullable=True)
    phone_number = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=False) # Becomes True upon admin approval
    is_verified = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    plan_type = db.Column(db.String(50), nullable=False) # monthly, yearly
    reference_number = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=True)
    status = db.Column(db.String(50), default='pending') # pending, approved
    starts_at = db.Column(db.DateTime, server_default=db.func.now())
    ends_at = db.Column(db.DateTime, nullable=True)
    cancel_at_period_end = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    user = db.relationship('User', backref=db.backref('subscriptions', lazy=True))

class ApiConfig(db.Model):
    __tablename__ = 'api_configs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), default="Default Config")
    url = db.Column(db.String(500))
    header_name = db.Column(db.String(100))
    token = db.Column(db.String(500))
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

class PrintHistory(db.Model):
    __tablename__ = 'print_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    template_name = db.Column(db.String(255))
    data_source = db.Column(db.JSON, nullable=False) # List of row objects
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    row_count = db.Column(db.Integer)

# Auth Decorators
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or not db.session.get(User, session['user_id']):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs): 
        user = db.session.get(User, session.get('user_id'))
        if not user or not user.is_admin:
            return "Access Denied", 403
        return f(*args, **kwargs)
    return decorated_function 

def subscription_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = User.query.get(session.get('user_id'))
        if not user:
            return redirect(url_for('login'))
        
        # Check for active subscription
        sub = Subscription.query.filter_by(user_id=user.id, status='approved').order_by(Subscription.ends_at.desc()).first()
        is_expired = sub and sub.ends_at and sub.ends_at < datetime.now()
        
        if (not user.is_active or is_expired) and not user.is_admin:
            flash("Your subscription is inactive or expired. Please renew to continue.", "warning")
            return redirect(url_for('profile'))
        return f(*args, **kwargs)
    return decorated_function

# Create tables
try:
    with app.app_context():
        db.create_all()
    print("PostgreSQL Tables initialized successfully.")
except Exception as e:
    print(f"CRITICAL: Failed to connect to PostgreSQL: {e}")

@app.route('/')
def landing():
    """Serves the public landing page."""
    user = None 
    if 'user_id' in session:
        user = db.session.get(User, session['user_id'])
    return render_template('landing.html', user=user)

@app.route('/designer')
@login_required 
@subscription_required
def designer():
    """Serves the main HTML page for the barcode designer."""
    user = User.query.get(session['user_id'])
    return render_template('index.html', user=user) # Assuming index.html is the designer page

# Authentication Routes
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        full_name = request.form.get('full_name')
        company = request.form.get('company')
        phone = request.form.get('phone')
        
        if db.session.execute(db.select(User).filter_by(email=email)).scalar_one_or_none():
            return "Email already exists", 400
        
        hashed_pw = generate_password_hash(password)
        new_user = User(
            email=email, 
            password=hashed_pw,
            full_name=full_name,
            company_name=company,
            phone_number=phone
        )
        db.session.add(new_user)
        db.session.commit()
        
        session['user_id'] = new_user.id
        return redirect(url_for('profile'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = request.form.get('remember-me')
        user = db.session.execute(db.select(User).filter_by(email=email)).scalar_one_or_none()
        
        if user and check_password_hash(user.password, password):
            session.permanent = True if remember else False
            session.modified = True # Explicitly mark session as modified to ensure permanent flag is saved
            session['user_id'] = user.id
            if user.is_admin:
                return redirect(url_for('admin_dashboard'))
            return redirect(url_for('profile'))
        flash("Invalid email or password. Please check your credentials and try again.", "error")
        return render_template('login.html'), 401
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

@app.route('/profile')
@login_required
def profile():
    user = db.session.get(User, session['user_id'])
    subscriptions = Subscription.query.filter_by(user_id=user.id).order_by(Subscription.created_at.desc()).all()
    # Get the latest one for status display
    subscription = subscriptions[0] if subscriptions else None
    # Get the latest APPROVED one specifically for the "Days Remaining" counter
    active_sub = Subscription.query.filter_by(user_id=user.id, status='approved').order_by(Subscription.ends_at.desc()).first()
    now = datetime.now()
    return render_template('profile.html', user=user, subscription=subscription, active_sub=active_sub, subscriptions=subscriptions, now=now)

@app.route('/api/subscribe', methods=['POST'])
@login_required
def subscribe():
    data = request.get_json()
    plan = data.get('plan')
    ref = data.get('reference')
    
    if not plan or not ref:
        return jsonify({"error": "Missing plan or reference"}), 400
        
    # Determine amount based on plan type from UI
    prices = {'basic': 299.00, 'starter': 499.00, 'pro': 1199.00}
    amount_paid = prices.get(plan.lower(), 0.00)

    new_sub = Subscription(user_id=session['user_id'], plan_type=plan, reference_number=ref, amount=amount_paid)
    db.session.add(new_sub)
    db.session.commit()
    return jsonify({"message": "Subscription submitted for approval"})

@app.route('/api/profile/update', methods=['POST'])
@login_required
def update_profile():
    data = request.get_json() 
    user = User.query.get(session['user_id'])
    
    user.full_name = data.get('full_name')
    user.company_name = data.get('company_name')
    user.phone_number = data.get('phone_number')
    
    db.session.commit()
    return jsonify({"message": "Profile updated successfully"})

@app.route('/api/profile/change-password', methods=['POST'])
@login_required
def change_password():
    data = request.get_json() 
    user = User.query.get(session['user_id'])
    
    current_pw = data.get('current_password')
    new_pw = data.get('new_password')
    
    if not current_pw or not new_pw:
        return jsonify({"error": "Missing password fields"}), 400
        
    if not check_password_hash(user.password, current_pw):
        return jsonify({"error": "Current password is incorrect"}), 400
        
    user.password = generate_password_hash(new_pw)
    db.session.commit()
    return jsonify({"message": "Password changed successfully"})

# Admin Routes
@app.route('/admin')
@login_required
@admin_required
def admin_dashboard():
    now = datetime.now()
    
    # 1. Approval Queue (Pending)
    pending_subs = Subscription.query.filter_by(status='pending').order_by(Subscription.created_at.desc()).all()
    
    # 2. Revenue calculation needs all approved records
    approved_subs = Subscription.query.filter_by(status='approved').all()
    
    # 3. Subscriber Records (Consolidated: Latest approved record for each unique user)
    latest_subs_query = db.session.query(
        Subscription.user_id, 
        db.func.max(Subscription.id).label('latest_id')
    ).filter(Subscription.status == 'approved').group_by(Subscription.user_id).subquery()

    subscribers = Subscription.query.join(
        latest_subs_query, Subscription.id == latest_subs_query.c.latest_id
    ).order_by(Subscription.ends_at.desc()).all()

    all_subs = Subscription.query.order_by(Subscription.created_at.desc()).all()
    active_users = db.session.query(User).filter_by(is_active=True, is_admin=False).count()
    user = User.query.get(session['user_id'])
    return render_template('admin.html', subscriptions=pending_subs, subscribers=subscribers, total_approved_subs=approved_subs, all_subscriptions=all_subs, active_users=active_users, user=user, now=now)

@app.route('/api/admin/approve/<int:sub_id>', methods=['POST'])
@login_required
@admin_required
def approve_subscription(sub_id):
    sub = Subscription.query.get_or_404(sub_id)
    now = datetime.now()
    
    # Terminate any existing active subscriptions for this user
    Subscription.query.filter(
        Subscription.user_id == sub.user_id,
        Subscription.status == 'approved',
        Subscription.id != sub.id
    ).update({"ends_at": now})

    sub.status = 'approved'
    sub.starts_at = now # New subscriptions always start from the approval date
    
    # All new plans are monthly (30 days)
    sub.ends_at = now + timedelta(days=30) 
        
    user = User.query.get(sub.user_id)
    user.is_active = True 
    db.session.commit()
    return jsonify({"message": "Subscription approved and user activated"})

@app.route('/api/subscription/cancel', methods=['POST'])
@login_required
def cancel_subscription():
    user_id = session['user_id']
    sub = Subscription.query.filter_by(user_id=user_id, status='approved').first()
    if not sub:
        return jsonify({"error": "No active subscription found"}), 404
    
    sub.cancel_at_period_end = True
    # In a real system, you'd integrate with Stripe/PayPal here
    db.session.commit()
    return jsonify({"message": "Subscription will be canceled at the end of the billing period"})


@app.route('/api/admin/reject/<int:sub_id>', methods=['POST'])
@login_required
@admin_required
def reject_subscription(sub_id):
    sub = db.session.get(Subscription, sub_id)
    try:
        db.session.delete(sub)
        db.session.commit()
        return jsonify({"message": "Subscription rejected and removed"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin/deactivate/<int:sub_id>', methods=['POST'])
@login_required
@admin_required
def deactivate_subscription(sub_id):
    sub = db.session.get(Subscription, sub_id)
    user = User.query.get(sub.user_id)
    try:
        sub.status = 'revoked'
        if user:
            user.is_active = False
        db.session.commit()
        return jsonify({"message": "Subscription deactivated and user disabled"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/help')
def help_page():
    """Serves the user manual/how-to-use page."""
    return render_template('help.html')

@app.route('/api/templates', methods=['POST'])
@login_required
def save_template():
    data = request.get_json()
    name = data.get('name')
    content = data.get('content')
    
    if not name or not content:
        return jsonify({"error": "Missing name or content"}), 400
        
    try:
        user_id = session['user_id']
        # Enforcement: Check Plan Limits
        user = db.session.get(User, user_id)
        sub = Subscription.query.filter_by(user_id=user_id, status='approved').first()
        plan_key = sub.plan_type.lower() if sub else 'free'
        plan_limit = PLANS.get(plan_key, PLANS['free'])['limit']
        
        current_count = Template.query.filter_by(user_id=user_id).count()
        if current_count >= plan_limit:
            return jsonify({"error": f"Plan limit reached ({plan_limit} templates). Please upgrade."}), 403

        new_template = Template(name=name, content=content, user_id=user_id)
        db.session.add(new_template)
        db.session.commit()
        return jsonify({"message": "Template saved successfully", "id": new_template.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Database Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/templates', methods=['GET'])
@login_required
def get_templates():
    try:
        # Only fetch templates belonging to the logged-in user
        templates = Template.query.filter_by(user_id=session['user_id']).order_by(Template.created_at.desc()).all()
        print(f"DEBUG: Found {len(templates)} templates in DB.")
        return jsonify([t.to_dict() for t in templates])
    except Exception as e:
        print(f"DEBUG ERROR: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/templates/<int:template_id>', methods=['PUT', 'DELETE'])
@login_required
def handle_template_id(template_id):
    template = db.session.get(Template, template_id)
    
    if template.user_id != session['user_id']:
        return jsonify({"error": "Unauthorized"}), 403

    if request.method == 'DELETE':
        db.session.delete(template)
        db.session.commit()
        return jsonify({"message": "Template deleted"})
    
    if request.method == 'PUT':
        data = request.get_json()
        name = data.get('name')
        content = data.get('content')
        
        if name:
            template.name = name
        if content:
            template.content = content
            
        try:
            db.session.commit()
            return jsonify({"message": "Template updated successfully", "id": template.id})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

@app.route('/api/api-config', methods=['GET', 'POST'])
@login_required
def handle_api_config():
    user_id = session['user_id']

    if request.method == 'GET':
        try:
            # Fetch all. If this fails, the table likely lacks columns from a previous version.
            configs = ApiConfig.query.filter_by(user_id=user_id).all()
            configs.sort(key=lambda x: x.id, reverse=True)
            
            return jsonify([{
                "id": c.id,
                "name": getattr(c, 'name', 'Default Config') or 'Default Config',
                "url": c.url,
                "header_name": c.header_name,
                "token": c.token
            } for c in configs])
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Database error: likely a schema mismatch. Please delete the 'api_configs' table and restart the app."}), 500

    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name', 'My API Config')
        
        # Update existing by name or create new
        config = ApiConfig.query.filter_by(user_id=user_id, name=name).first()
        if not config:
            config = ApiConfig(user_id=user_id, name=name)
            db.session.add(config)

        config.url = data.get('url')
        config.header_name = data.get('header_name')
        config.token = data.get('token')

        try:
            db.session.commit()
            return jsonify({"message": "API Configuration saved successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

@app.route('/api/api-config/<int:config_id>', methods=['DELETE'])
@login_required
def delete_api_config(config_id):
    user_id = session['user_id']
    config = ApiConfig.query.filter_by(id=config_id, user_id=user_id).first_or_404()
    try:
        db.session.delete(config)
        db.session.commit()
        return jsonify({"message": "Configuration deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/print-history', methods=['GET', 'POST'])
@login_required
def handle_print_history():
    user_id = session['user_id']
    
    if request.method == 'GET':
        history = PrintHistory.query.filter_by(user_id=user_id).order_by(PrintHistory.created_at.desc()).all()
        return jsonify([{
            "id": h.id,
            "template_name": h.template_name,
            "row_count": h.row_count,
            "data_source": h.data_source,
            "created_at": h.created_at.isoformat()
        } for h in history])

    if request.method == 'POST':
        data = request.get_json()
        new_history = PrintHistory(
            user_id=user_id,
            template_name=data.get('template_name', 'Unnamed Template'),
            data_source=data.get('data', []),
            row_count=len(data.get('data', []))
        )
        db.session.add(new_history)
        db.session.commit()
        return jsonify({"message": "Print history saved", "id": new_history.id})

@app.route('/api/print-history/<int:history_id>', methods=['DELETE'])
@login_required
def delete_print_history(history_id):
    user_id = session['user_id']
    item = PrintHistory.query.filter_by(id=history_id, user_id=user_id).first_or_404()
    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "History record deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/generate_barcode', methods=['POST'])
def generate_barcode():
    """
    API endpoint to generate a barcode image based on value and type.
    Returns the barcode image as a base64 encoded PNG.
    """
    data = request.get_json()
    barcode_value = data.get('value')
    barcode_type_str = data.get('type')

    if not barcode_value or not barcode_type_str:
        return jsonify({"error": "Missing barcode value or type"}), 400

    try:
        if barcode_type_str.lower() == 'qrcode':
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,
                box_size=10,
                border=int(data.get('margin', 4)),
            )
            qr.add_data(barcode_value)
            qr.make(fit=True)

            # Determine module shape drawer
            module_shape = data.get('module_shape', 'square')
            if module_shape == 'rounded':
                drawer = RoundedModuleDrawer()
            elif module_shape == 'circle':
                drawer = CircleModuleDrawer()
            else:
                drawer = SquareModuleDrawer()

            img = qr.make_image(image_factory=StyledPilImage, module_drawer=drawer).convert('RGBA')
            
            # Handle Logo Embedding
            logo_b64 = data.get('logo')
            if logo_b64:
                logo_data = base64.b64decode(logo_b64.split(',')[1] if ',' in logo_b64 else logo_b64)
                logo = Image.open(io.BytesIO(logo_data)).convert("RGBA")
                
                # Calculate size and padding
                qr_w, qr_h = img.size
                logo_size_percent = float(data.get('logo_size', 25)) / 100.0
                logo_padding = int(data.get('logo_padding', 0))
                
                logo_size = int(qr_w * logo_size_percent)
                logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
                
                if data.get('logo_rounded'):
                    mask = Image.new('L', (logo_size, logo_size), 0)
                    draw = ImageDraw.Draw(mask)
                    draw.ellipse((0, 0, logo_size, logo_size), fill=255)
                    logo.putalpha(mask)

                # Total size of the overlay area including padding
                bg_size = logo_size + (logo_padding * 2)

                # Position logic
                pos = data.get('logo_position', 'center')
                if pos == 'top-left': bg_offset = (0, 0)
                elif pos == 'top-right': bg_offset = (qr_w - bg_size, 0)
                elif pos == 'bottom-left': bg_offset = (0, qr_h - bg_size)
                elif pos == 'bottom-right': bg_offset = (qr_w - bg_size, qr_h - bg_size)
                else: # center
                    bg_offset = ((qr_w - bg_size) // 2, ((qr_h - bg_size) // 2))
                
                # Create a background for the logo area (Quiet Zone).
                bg_color = data.get('logo_bg_color', '#ffffff')
                quiet_zone_bg = Image.new("RGBA", (bg_size, bg_size), bg_color)
                
                if data.get('logo_rounded'):
                    # Round the quiet zone (the "logo holder") to match the rounded logo
                    bg_mask = Image.new('L', (bg_size, bg_size), 0)
                    bg_draw = ImageDraw.Draw(bg_mask)
                    bg_draw.ellipse((0, 0, bg_size, bg_size), fill=255)
                    quiet_zone_bg.putalpha(bg_mask)
                    img.paste(quiet_zone_bg, bg_offset, quiet_zone_bg)
                else:
                    # Rectangular quiet zone
                    img.paste(quiet_zone_bg, bg_offset)
                
                # Paste logo with padding
                logo_offset = (bg_offset[0] + logo_padding, bg_offset[1] + logo_padding)
                img.paste(logo, logo_offset, logo)

            fp = io.BytesIO()
            img.save(fp, format='PNG')
            fp.seek(0)
            img_base64 = base64.b64encode(fp.read()).decode('utf-8')
            return jsonify({"image": f"data:image/png;base64,{img_base64}"})

        BarcodeClass = barcode.get_barcode_class(barcode_type_str)
        # Extract options with defaults
        options = {
            'font_size': int(data.get('font_size', 10)),
            'quiet_zone': 6.5,
            'text_distance': float(data.get('margin', 5.0)),
            'write_text': data.get('write_text', True)
        }
        my_barcode = BarcodeClass(barcode_value, writer=ImageWriter())
        fp = io.BytesIO()
        my_barcode.write(fp, options=options)
        fp.seek(0)
        img_base64 = base64.b64encode(fp.read()).decode('utf-8')
        return jsonify({"image": f"data:image/png;base64,{img_base64}"})
    except barcode.errors.BarcodeNotFoundError:
        return jsonify({"error": f"Barcode type '{barcode_type_str}' not found or invalid"}), 400
    except (barcode.errors.IllegalCharacterError, barcode.errors.NumberOfDigitsError) as e:
        return jsonify({"error": f"Invalid data for barcode type: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to generate barcode: {str(e)}"}), 500

# --- CLI Commands ---
@app.cli.command("init-admin")
@click.argument("email")
@click.argument("password")
def init_admin(email, password):
    """
    Creates a new admin or promotes an existing user to admin.
    Usage: flask init-admin admin@example.com securepassword
    """
    user = User.query.filter_by(email=email).first()
    if user: 
        user.is_admin = True
        user.is_active = True
        user.is_verified = True
        user.password = generate_password_hash(password)
        click.echo(f"User {email} has been promoted to Admin and password updated.")
    else:
        new_admin = User(
            email=email,
            password=generate_password_hash(password),
            is_admin=True,
            is_active=True,
            is_verified=True,
            full_name="System Administrator"
        )
        db.session.add(new_admin)
        click.echo(f"Created new Admin account: {email}")
    db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)